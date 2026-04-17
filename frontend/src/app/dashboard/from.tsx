import { useState, useEffect, useRef } from "react";

const locationConfig = {
  calgary: {
    label: "Calgary – Pioneer Trucking",
    address: "Unit 1010 - 4231 109 Ave. NE Calgary",
    workingDays: [1, 2, 3, 4, 5, 6],
    slots: [
      "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
      "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
      "3:00 PM","3:30 PM","4:00 PM"
    ]
  },
  edmonton: {
    label: "Edmonton – G&G Trucking Solutions",
    address: "8810 51 Ave NW",
    workingDays: [1, 2, 3, 4, 5],
    slots: [
      "8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM",
      "11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
      "3:00 PM","3:30 PM","4:00 PM"
    ]
  },
  ottawa: {
    label: "Ottawa – Crossroad Truck & Career Academy",
    address: "",
    workingDays: [1, 2, 3, 4, 5],
    slots: [
      "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM",
      "1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM"
    ]
  }
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const FULL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function MiniCalendar({ selectedDate, onSelectDate, workingDays }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={calStyles.calendar}>
      <div style={calStyles.header}>
        <button style={calStyles.navBtn} onClick={prevMonth}>‹</button>
        <span style={calStyles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
        <button style={calStyles.navBtn} onClick={nextMonth}>›</button>
      </div>
      <div style={calStyles.grid}>
        {DAYS.map(d => <div key={d} style={calStyles.dayName}>{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0,0,0,0);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
          const dayOfWeek = date.getDay();
          const isOff = workingDays && !workingDays.includes(dayOfWeek);

          let cellStyle = { ...calStyles.cell };
          if (isPast) cellStyle = { ...cellStyle, ...calStyles.past };
          else if (isSelected) cellStyle = { ...cellStyle, ...calStyles.selected };
          else if (isToday) cellStyle = { ...cellStyle, ...calStyles.today };
          else if (isOff) cellStyle = { ...cellStyle, ...calStyles.off };

          return (
            <div
              key={day}
              style={cellStyle}
              onClick={() => !isPast && !isOff && onSelectDate(date)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const calStyles = {
  calendar: { background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e0e0e0", userSelect: "none" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  monthLabel: { fontWeight: 600, color: "#606c38", fontSize: "0.95rem" },
  navBtn: { background: "#f0f2f5", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#4a69bd", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 },
  dayName: { textAlign: "center", fontSize: "0.72rem", color: "#999", padding: "4px 0", fontWeight: 600 },
  cell: { textAlign: "center", padding: "6px 2px", borderRadius: 4, fontSize: "0.82rem", cursor: "pointer", transition: "background 0.15s", color: "#333" },
  past: { color: "#ccc", cursor: "default" },
  selected: { background: "#4a69bd", color: "#fff", fontWeight: 700 },
  today: { border: "1.5px solid #4a69bd", color: "#4a69bd", fontWeight: 700 },
  off: { color: "#ddd", cursor: "default", textDecoration: "line-through" }
};

export const AppointmentBooking = () => {
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [dotType, setDotType] = useState("us-dot");
  const [usTest, setUsTest] = useState("drug-only");
  const [nonDotTest, setNonDotTest] = useState("");
  const [reason, setReason] = useState("");
  const [isDer, setIsDer] = useState("yes");
  const [emailAppt, setEmailAppt] = useState("no");
  const [addEmail, setAddEmail] = useState("no");
  const [captcha, setCaptcha] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const opts = { timeZone: "America/Edmonton", hour: "2-digit", minute: "2-digit", hour12: true };
      setClock(new Intl.DateTimeFormat("en-US", opts).format(new Date()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const config = location ? locationConfig[location] : null;
  const dayOfWeek = selectedDate ? selectedDate.getDay() : null;
  const isOff = selectedDate && config && !config.workingDays.includes(dayOfWeek);

  const formatDate = (d) => {
    if (!d) return "";
    return `${FULL_DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatDateShort = (d) => {
    if (!d) return "Select Date";
    return `${FULL_DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  };

  const changeDate = (delta) => {
    const base = selectedDate || new Date();
    const next = new Date(base);
    next.setDate(base.getDate() + delta);
    const today = new Date(); today.setHours(0,0,0,0);
    if (next < today) return;
    setSelectedDate(next);
    setSelectedTime("");
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleDateSelect = (d) => {
    setSelectedDate(d);
    setSelectedTime("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.containerBox}>

        {/* Location */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Location for Test: <span style={styles.req}>*</span></label>
          <select style={styles.select} value={location} onChange={handleLocationChange}>
            <option value="">Select Location</option>
            <option value="calgary">Calgary – Pioneer Trucking</option>
            <option value="edmonton">Edmonton – G&G Trucking Solutions</option>
            <option value="ottawa">Ottawa – Crossroad Truck & Career Academy</option>
          </select>
        </div>

        {/* Appointment UI */}
        {location && (
          <div style={styles.appointmentBox}>
            <div style={styles.appointmentTitle}>
              APPOINTMENT DETAILS {locationConfig[location].label.toUpperCase()}
              {locationConfig[location].address && ` (${locationConfig[location].address})`}
            </div>

            <div style={styles.calRow}>
              {/* Calendar */}
              <div style={{ flex: "0 0 auto" }}>
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  workingDays={config.workingDays}
                />
              </div>

              {/* Time Slots */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {!selectedDate && (
                  <div style={styles.noDateMsg}>
                    <span style={{ fontSize: "2rem" }}>📅</span>
                    <div style={{ marginTop: 8, color: "#888" }}>Please select a date</div>
                  </div>
                )}

                {selectedDate && isOff && (
                  <div style={styles.offMessage}>
                    <span style={{ fontSize: "2.5rem" }}>🗓️</span>
                    <div style={{ marginTop: 10, fontWeight: 700, fontSize: "1.1rem" }}>
                      {dayOfWeek === 0 ? "LABS ARE OFF ON SUNDAY" : "LABS ARE OFF ON SATURDAY"}
                    </div>
                  </div>
                )}

                {selectedDate && !isOff && (
                  <div>
                    <div style={styles.timeHeader}>
                      <span style={styles.dateLabel}>{formatDateShort(selectedDate)}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={styles.navBtn} onClick={() => changeDate(-1)}>‹</button>
                        <button style={styles.navBtn} onClick={() => changeDate(1)}>›</button>
                      </div>
                    </div>
                    <div style={styles.slotsGrid}>
                      {config.slots.map(t => (
                        <div
                          key={t}
                          style={selectedTime === t ? { ...styles.slot, ...styles.slotActive } : styles.slot}
                          onClick={() => setSelectedTime(t)}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.clockRow}>
                  🕐 America/Edmonton ({clock}) 🔒
                </div>
              </div>
            </div>

            {/* Selected Box */}
            {selectedTime && selectedDate && !isOff && (
              <div style={styles.selectedBox}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: "1.8rem" }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Selected Time</div>
                    <div>{selectedTime} {formatDate(selectedDate)}</div>
                  </div>
                </div>
                <button style={styles.cancelBtn} onClick={() => setSelectedTime("")}>Cancel Selection</button>
              </div>
            )}
          </div>
        )}

        {/* DOT Toggle */}
        <div style={styles.toggleBox}>
          <label style={styles.label}>US DOT / NON-DOT <span style={styles.req}>*</span></label>
          <div style={styles.radioRow}>
            <label style={styles.radioLabel}>
              <input type="radio" name="dot" value="us-dot" checked={dotType === "us-dot"} onChange={() => setDotType("us-dot")} style={{ marginRight: 6 }} />
              US DOT
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="dot" value="non-dot" checked={dotType === "non-dot"} onChange={() => setDotType("non-dot")} style={{ marginRight: 6 }} />
              Non-DOT
            </label>
          </div>
        </div>

        {/* US DOT Tests */}
        {dotType === "us-dot" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Testing to be Performed: <span style={styles.req}>*</span></label>
            {[
              { val: "drug-only", label: "Drug Test Only (US DOT Urine)" },
              { val: "drug-alcohol", label: "Drug and Alcohol Test (Drug-US DOT Urine/Alcohol- Breath or Saliva)" },
              { val: "alcohol-only", label: "Alcohol Test only (Breath or Saliva)" }
            ].map(opt => (
              <label key={opt.val} style={styles.checkLabel}>
                <input type="radio" name="usTest" value={opt.val} checked={usTest === opt.val} onChange={() => setUsTest(opt.val)} style={{ marginRight: 8 }} />
                {opt.label}
              </label>
            ))}
          </div>
        )}

        {/* Non-DOT Test */}
        {dotType === "non-dot" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Drug Test to be Performed: <span style={styles.req}>*</span></label>
            <select style={styles.select} value={nonDotTest} onChange={e => setNonDotTest(e.target.value)}>
              <option value="" disabled>Please Select</option>
              <option>Express Drug Test (Urine)</option>
              <option>Lab Based Drug Test (Urine)</option>
              <option>Oral Fluid (Saliva) Test</option>
            </select>
          </div>
        )}

        {/* Reason */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Reason for Test: <span style={styles.req}>*</span></label>
          <select style={styles.select} value={reason} onChange={e => setReason(e.target.value)}>
            <option value="" disabled>Please Select</option>
            <option value="Pre-employment">Pre-employment</option>
            <option value="Random">Random</option>
            <option value="Post-Accident">Post-Accident</option>
          </select>
        </div>

        {/* Driver Info */}
        <div style={styles.sectionTitle}>Driver Information</div>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Driver First Name <span style={styles.req}>*</span></label>
            <input style={styles.input} type="text" />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Driver Last Name <span style={styles.req}>*</span></label>
            <input style={styles.input} type="text" />
          </div>
        </div>

        {/* Pre-employment fields */}
        {reason === "Pre-employment" && (
          <div style={styles.fieldGroup}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Drivers License Number (Not Required):</label>
              <input style={styles.input} type="text" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Drivers License Issuing State/Province:</label>
              <input style={styles.input} type="text" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date of Birth:</label>
              <input style={styles.input} type="date" />
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>Date</div>
            </div>
          </div>
        )}

        {/* Company Info */}
        <div style={styles.sectionTitle}>Company Contact Information</div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Company Name <span style={styles.req}>*</span></label>
          <input style={styles.input} type="text" />
        </div>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Your First Name <span style={styles.req}>*</span></label>
            <input style={styles.input} type="text" />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Your Last Name <span style={styles.req}>*</span></label>
            <input style={styles.input} type="text" />
          </div>
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Your Email <span style={styles.req}>*</span></label>
          <input style={styles.input} type="email" placeholder="name@company.com" />
        </div>
        <div style={styles.row}>
          <div style={{ flex: 2 }}>
            <label style={styles.label}>Phone Number <span style={styles.req}>*</span></label>
            <input style={styles.input} type="tel" placeholder="(000) 000-0000" />
          </div>
          <div style={{ flex: 1, marginLeft: 12 }}>
            <label style={styles.label}>Ext.</label>
            <input style={styles.input} type="text" />
          </div>
        </div>

        {/* DER */}
        <div style={styles.toggleBox}>
          <label style={styles.label}>Are you a DER (Designated Employer Representative)? <span style={styles.req}>*</span></label>
          <div style={styles.radioRow}>
            <label style={styles.radioLabel}>
              <input type="radio" name="der" value="yes" checked={isDer === "yes"} onChange={() => setIsDer("yes")} style={{ marginRight: 6 }} />
              Yes
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="der" value="no" checked={isDer === "no"} onChange={() => setIsDer("no")} style={{ marginRight: 6 }} />
              No
            </label>
          </div>
        </div>

        {isDer === "no" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Enter DER Name:</label>
            <div style={styles.row}>
              <div style={styles.col}>
                <input style={styles.input} type="text" placeholder="First Name" />
              </div>
              <div style={styles.col}>
                <input style={styles.input} type="text" placeholder="Last Name" />
              </div>
            </div>
            <div style={{ ...styles.row, marginTop: 10 }}>
              <div style={{ flex: 2 }}>
                <label style={styles.label}>DER Contact No.:</label>
                <input style={styles.input} type="tel" placeholder="(000) 000-0000" />
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <label style={styles.label}>Ext. #</label>
                <input style={styles.input} type="text" placeholder="e.g., 23" />
              </div>
            </div>
            <hr style={{ margin: "16px 0" }} />
          </div>
        )}

        {/* Email appointment */}
        <div style={styles.toggleBox}>
          <label style={styles.label}>Would you like to email the appointment details to the driver or another person? <span style={styles.req}>*</span></label>
          <div style={styles.radioRow}>
            <label style={styles.radioLabel}>
              <input type="radio" name="emailAppt" value="yes" checked={emailAppt === "yes"} onChange={() => setEmailAppt("yes")} style={{ marginRight: 6 }} />
              Yes
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="emailAppt" value="no" checked={emailAppt === "no"} onChange={() => setEmailAppt("no")} style={{ marginRight: 6 }} />
              No
            </label>
          </div>
        </div>

        {emailAppt === "yes" && (
          <div style={styles.fieldGroup}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Enter Driver Email:</label>
              <input style={styles.input} type="email" placeholder="example@example.com" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Other Person Email:</label>
              <input style={styles.input} type="email" placeholder="example@example.com" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Add Additional Email</label>
              <div style={styles.radioRow}>
                <label style={styles.radioLabel}>
                  <input type="radio" name="addEmail" value="yes" checked={addEmail === "yes"} onChange={() => setAddEmail("yes")} style={{ marginRight: 6 }} />
                  Yes
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name="addEmail" value="no" checked={addEmail === "no"} onChange={() => setAddEmail("no")} style={{ marginRight: 6 }} />
                  No
                </label>
              </div>
            </div>
            {addEmail === "yes" && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Enter Additional Email:</label>
                <input style={styles.input} type="email" placeholder="extra-email@example.com" />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Notes:</label>
          <textarea style={{ ...styles.input, height: 100, resize: "vertical" }} />
        </div>

        {/* Captcha */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Please verify that you are human <span style={styles.req}>*</span></label>
          <div style={styles.captchaBox}>
            <input type="checkbox" checked={captcha} onChange={e => setCaptcha(e.target.checked)} style={{ width: 20, height: 20, cursor: "pointer" }} />
            <span style={{ marginLeft: 12 }}>I'm not a robot</span>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" style={{ marginLeft: "auto", width: 30 }} />
          </div>
        </div>

        {/* Submit */}
        <button style={styles.submitBtn} type="button">Submit</button>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "20px 0" },
  containerBox: { maxWidth: 950, margin: "40px auto", background: "#f1f8f1", padding: 35, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  fieldGroup: { marginBottom: 20 },
  label: { fontWeight: 500, color: "#4b5a41", display: "block", marginBottom: 6 },
  req: { color: "#dc3545" },
  select: { width: "50%", padding: "10px", borderRadius: 6, border: "1px solid #ced4da", fontSize: "0.95rem", background: "#fff" },
  input: { width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ced4da", fontSize: "0.95rem", boxSizing: "border-box", background: "#fff" },
  row: { display: "flex", gap: 12, marginBottom: 16 },
  col: { flex: 1 },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#606c38", borderBottom: "2px solid #606c38", paddingBottom: 6, marginBottom: 16, marginTop: 10 },
  toggleBox: { marginBottom: 20, padding: "14px 18px", background: "#fff", borderRadius: 8, border: "1px solid #e0e8d0" },
  radioRow: { display: "flex", gap: 30, marginTop: 8 },
  radioLabel: { fontWeight: 400, color: "#333", display: "flex", alignItems: "center", cursor: "pointer" },
  checkLabel: { display: "flex", alignItems: "flex-start", marginBottom: 8, cursor: "pointer", fontWeight: 400, color: "#333" },
  appointmentBox: { background: "#fff", padding: 20, border: "1px solid #ddd", borderRadius: 8, marginBottom: 24 },
  appointmentTitle: { color: "#606c38", fontSize: "1rem", fontWeight: 700, marginBottom: 16 },
  calRow: { display: "flex", gap: 20, flexWrap: "wrap" },
  timeHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  dateLabel: { color: "#606c38", fontSize: "1.1rem", fontWeight: 500 },
  navBtn: { background: "#f0f2f5", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", color: "#4a69bd", fontSize: "1.2rem", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  slotsGrid: { display: "flex", flexWrap: "wrap", gap: 10, maxHeight: 360, overflowY: "auto" },
  slot: { flex: "0 0 calc(50% - 5px)", border: "1px solid #4a90e2", color: "#4a90e2", padding: "10px", textAlign: "center", borderRadius: 5, cursor: "pointer", background: "#fff", fontSize: "0.9rem", transition: "all 0.2s", boxSizing: "border-box" },
  slotActive: { background: "#4a69bd", color: "#fff", borderColor: "#4a69bd" },
  offMessage: { color: "#d9534f", fontWeight: "bold", padding: "40px 20px", textAlign: "center", border: "1px dashed #d9534f", borderRadius: 8, background: "#fff5f5", display: "flex", flexDirection: "column", alignItems: "center" },
  noDateMsg: { textAlign: "center", padding: 40, color: "#aaa" },
  selectedBox: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#4e73df", color: "#fff", padding: "15px 25px", borderRadius: 8, marginTop: 20, flexWrap: "wrap", gap: 10 },
  cancelBtn: { background: "#fff", border: "none", padding: "8px 15px", borderRadius: 5, fontWeight: 600, cursor: "pointer", color: "#333" },
  clockRow: { fontSize: "0.82rem", color: "#666", marginTop: 14 },
  captchaBox: { display: "flex", alignItems: "center", background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, padding: "12px 16px", width: 300 },
  submitBtn: { width: "100%", backgroundColor: "#1ebc61", color: "#fff", border: "none", padding: 15, fontSize: "1.4rem", fontWeight: 500, borderRadius: 10, cursor: "pointer", transition: "background 0.3s" }
};
export default AppointmentBooking;