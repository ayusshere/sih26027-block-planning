import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import DashboardPage from './pages/DashboardPage';
import BlockPlanningPage from './pages/BlockPlanningPage';
import AssetTrackerPage from './pages/AssetTrackerPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RecommendationModal from './components/blocks/RecommendationModal';
import ShadowBlockModal from './components/blocks/ShadowBlockModal';
import CorridorPlanModal from './components/blocks/CorridorPlanModal';
import BlockRequestForm from './components/blocks/BlockRequestForm';
import { blockService } from './services/blockService';
import { fireOptimizationCelebration } from './utils/confetti';
import { MOCK_BLOCKS, MOCK_SCHEDULES, MOCK_TRACKS, MOCK_ASSETS } from './services/mockData';
import { Loader, AlertTriangle } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [blocks, setBlocks] = useState(MOCK_BLOCKS);
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  const [tracks, setTracks] = useState(MOCK_TRACKS);
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('mock'); // 'mock' or 'api'

  // Pre-filled date and track for block request form
  const [formInitialDate, setFormInitialDate] = useState('2026-09-08');
  const [formInitialTrackId, setFormInitialTrackId] = useState(null);

  const isLoginPage = location.pathname === '/login';

  // Load data from backend API or use mock data
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        console.log('[App] Attempting to fetch data from backend...');

        // Try to fetch from backend
        const [liveBlocks, liveSchedules, liveTracks, liveAssets] = await Promise.allSettled([
          blockService.getAllBlocks(),
          blockService.getSchedules(),
          blockService.getTracks(),
          blockService.getAssets(),
        ]);

        const hasSuccessfulRequests = [liveBlocks, liveSchedules, liveTracks, liveAssets].some(
          (result) => result.status === 'fulfilled'
        );

        if (hasSuccessfulRequests) {
          if (liveBlocks.status === 'fulfilled' && liveBlocks.value?.length) {
            setBlocks(liveBlocks.value);
            setDataSource('api');
            console.log('[App] ✅ Blocks loaded from API:', liveBlocks.value.length);
          }

          if (liveSchedules.status === 'fulfilled' && liveSchedules.value?.length) {
            setSchedules(liveSchedules.value);
            console.log('[App] ✅ Schedules loaded from API:', liveSchedules.value.length);
          }

          if (liveTracks.status === 'fulfilled' && liveTracks.value?.length) {
            setTracks(liveTracks.value);
            console.log('[App] ✅ Tracks loaded from API:', liveTracks.value.length);
          }

          if (liveAssets.status === 'fulfilled' && liveAssets.value?.length) {
            setAssets(liveAssets.value);
            console.log('[App] ✅ Assets loaded from API:', liveAssets.value.length);
          }
        } else {
          console.info('[App] ⚠️ Backend unavailable. Operating in offline demo mode.');
          setDataSource('mock');
        }
      } catch (err) {
        console.error('[App] Error loading initial corridor data:', err);
        setDataSource('mock');
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleOpenOptimizer = (block) => {
    setSelectedBlock(block);
    setActiveModal('OPTIMIZER');
  };

  const handleOpenRequestForm = (date = null, trackId = null) => {
    if (date) setFormInitialDate(date);
    if (trackId) setFormInitialTrackId(trackId);
    setActiveModal('REQUEST_FORM');
  };

  const handleApplySlot = async (slot) => {
    if (!selectedBlock) return;

    // Optimistically update frontend state
    const updatedBlocks = blocks.map((b) => {
      if (b.id === selectedBlock.id) {
        return {
          ...b,
          status: 'APPROVED',
          allocatedStartTime: slot.proposedStartTime,
          allocatedEndTime: slot.proposedEndTime,
          hasConflict: false,
          conflicts: [],
        };
      }
      return b;
    });

    setBlocks(updatedBlocks);
    fireOptimizationCelebration();
    showNotification(`Slot Allocated! Block #${selectedBlock.id} scheduled.`);

    // Backend synchronization call (non-blocking)
    if (dataSource === 'api') {
      blockService
        .approveBlock(selectedBlock.id, {
          allocatedStartTime: slot.proposedStartTime,
          allocatedEndTime: slot.proposedEndTime,
        })
        .catch((err) => {
          console.error('Failed to sync block approval:', err);
        });
    }

    // Check for shadow blocking opportunity
    if (selectedBlock.shadowBlockOpportunities?.length > 0) {
      setActiveModal('SHADOW');
    } else {
      setActiveModal(null);
    }
  };

  const handleConfirmBundle = (opportunity) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === selectedBlock?.id) {
          return {
            ...b,
            title: `${b.title} + ${opportunity.assetName} [Bundled]`,
          };
        }
        return b;
      })
    );
    showNotification(`Maintenance Bundled! Servicing for ${opportunity.assetName} merged.`);
    setActiveModal(null);
  };

  const handleOpenCorridorPlan = () => {
    setActiveModal('CORRIDOR_PLAN');
  };

  const handleApplyCorridorPlan = (plan) => {
    // Synchronize all conflicting blocks into approved night lull slots
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.status === 'CONFLICT' || b.hasConflict) {
          return {
            ...b,
            status: 'APPROVED',
            allocatedStartTime: b.scheduledDate ? `${b.scheduledDate}T01:30:00` : '2026-09-08T01:30:00',
            allocatedEndTime: b.scheduledDate ? `${b.scheduledDate}T04:30:00` : '2026-09-08T04:30:00',
            hasConflict: false,
            conflicts: [],
            conflictRemarks: 'Approved as part of Integrated Corridor Mega-Block',
          };
        }
        return b;
      })
    );
    fireOptimizationCelebration();
    showNotification('Corridor Mega-Block Plan applied! 11 collisions wiped out, 270 mins delay saved.');
  };

  const handleResetDemo = () => {
    setBlocks(JSON.parse(JSON.stringify(MOCK_BLOCKS)));
    showNotification('Demo Reset: Active Vande Bharat clash re-established on Line 1 for presentation.');
  };

  const handleAddNewBlock = async (newBlock) => {
    setBlocks((prev) => [newBlock, ...prev]);
    showNotification(`Block #${newBlock.id} submitted for ${newBlock.scheduledDate || 'selected date'}. Status: ${newBlock.status}`);

    if (dataSource === 'api') {
      try {
        const payload = {
          title: newBlock.title,
          trackId: newBlock.trackId,
          department: newBlock.department,
          assetId: newBlock.assetId,
          requestedByUserId: newBlock.requestedByUserId || 1,
          requestedStartTime: newBlock.requestedStartTime,
          requestedEndTime: newBlock.requestedEndTime,
          purpose: newBlock.purpose,
          priority: newBlock.priority,
          autoOptimize: false,
        };
        await blockService.createBlock(payload);
      } catch (err) {
        console.error('Failed to create block on backend:', err);
      }
    }
  };

  const handlePlanFromAsset = (asset) => {
    if (asset?.trackId) setFormInitialTrackId(asset.trackId);
    setActiveModal('REQUEST_FORM');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <Loader className={`w-10 h-10 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">
            Connecting to Indian Railways Corridor Database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Show Navbar on all pages except Login */}
      {!isLoginPage && <Navbar />}

      {/* Offline Demo Banner */}
      {!isLoginPage && dataSource === 'mock' && (
        <div className={`px-4 py-2 text-center text-xs font-semibold border-b transition-colors flex items-center justify-center gap-1.5 ${
          isDarkMode
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle size={13} className="text-amber-500 shrink-0" />
          <span>Operating in Offline Demo Mode. Backend unavailable — using Delhi Division mock dataset.</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage
                  blocks={blocks}
                  tracks={tracks}
                  schedules={schedules}
                  assets={assets}
                  setBlocks={setBlocks}
                  onOpenOptimizer={handleOpenOptimizer}
                  onOpenCorridorPlan={handleOpenCorridorPlan}
                  onRequestBlockForDate={handleOpenRequestForm}
                  onResetDemo={handleResetDemo}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/network"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/blocks"
            element={
              <ProtectedRoute>
                <BlockPlanningPage
                  blocks={blocks}
                  onOpenRequestForm={() => handleOpenRequestForm()}
                  onOpenOptimizer={handleOpenOptimizer}
                  onOpenCorridorPlan={handleOpenCorridorPlan}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetTrackerPage
                  assets={assets}
                  tracks={tracks}
                  onPlanMaintenanceForAsset={handlePlanFromAsset}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          isDarkMode
            ? 'bg-slate-900 border-emerald-500/60 text-emerald-300'
            : 'bg-slate-900 border-emerald-500/60 text-emerald-300'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <RecommendationModal
        isOpen={activeModal === 'OPTIMIZER'}
        block={selectedBlock}
        onClose={() => setActiveModal(null)}
        onApplySlot={handleApplySlot}
      />

      <ShadowBlockModal
        isOpen={activeModal === 'SHADOW'}
        block={selectedBlock}
        onClose={() => setActiveModal(null)}
        onConfirmBundle={handleConfirmBundle}
      />

      <CorridorPlanModal
        isOpen={activeModal === 'CORRIDOR_PLAN'}
        onClose={() => setActiveModal(null)}
        onApplyCorridorPlan={handleApplyCorridorPlan}
      />

      <BlockRequestForm
        isOpen={activeModal === 'REQUEST_FORM'}
        onClose={() => setActiveModal(null)}
        tracks={tracks}
        assets={assets}
        schedules={schedules}
        initialDate={formInitialDate}
        initialTrackId={formInitialTrackId}
        onSubmitBlock={handleAddNewBlock}
      />
    </div>
  );
}