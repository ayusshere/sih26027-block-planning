package com.sih.blockplanning.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    public static final DateTimeFormatter RAILWAY_FORMAT = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm 'hrs'");

    public static String formatRailwayTime(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        return dateTime.format(RAILWAY_FORMAT);
    }
}
