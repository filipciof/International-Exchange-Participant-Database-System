export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  // Academic year starts in September (month 8)
  if (currentMonth < 8) {
    const prevYear = currentYear - 1;
    return `${prevYear}/${String(currentYear).slice(-2)}`;
  } else {
    const nextYear = currentYear + 1;
    return `${currentYear}/${String(nextYear).slice(-2)}`;
  }
};
