// 🧮 Helper: calculate total break and working durations
const calculateWorkingTime = (attendance) => {
    if (!attendance.punchInTime) return 0;
  
    let totalBreakTime = 0;
    let now = new Date();
  
    // Sum all breaks that have both start and end
    attendance.breaks.forEach((b) => {
      if (b.breakStart && b.breakEnd) {
        totalBreakTime += b.breakEnd - b.breakStart;
      }
    });
  
    // Determine current end time (if punchOut not done yet)
    const endTime = attendance.punchOutTime || now;
  
    // Total work duration = time between punchIn and punchOut - breaks
    const totalWorkTime = endTime - attendance.punchInTime - totalBreakTime;
  
    return totalWorkTime > 0 ? totalWorkTime : 0;
  };
  
  // ⏱ Convert milliseconds → HH:MM:SS string
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  export { calculateWorkingTime, formatDuration };