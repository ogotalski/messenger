package org.training.messenger.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.sql.Date;
import java.sql.Timestamp;

public class Formatter {
	private static final SimpleDateFormat XML_DATE_FORMATTER = new SimpleDateFormat(
			"hh:mm:ss dd-MM-yyyy");
	private static final SimpleDateFormat OUT_DATE_FORMATTER = new SimpleDateFormat(
			"hh:mm:ss dd-MM-yyyy");

	public static Timestamp parse(String str) {
		try {
			return new Timestamp(XML_DATE_FORMATTER.parse(str).getTime());
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			throw new IllegalArgumentException(e);
		}
	}

	public static int parseInt(String orderString, int defaultVal) {
		int order = defaultVal;
		try {
			if (orderString != null) {
				order = Integer.parseInt(orderString);
				if (order == 0) {
					order = defaultVal;
				}
			}
		} catch (NumberFormatException e) {
			order = defaultVal;
		}
		return order;
	}

	public static String format(Timestamp date) {
		return OUT_DATE_FORMATTER.format(date);

	}

	public static String capitalizeFirstLetter(String original) {

		if (original != null && original.length() == 0)
			return original;
		return original.substring(0, 1).toUpperCase() + original.substring(1);
	}
}
