import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatDayMonth, formatTime, formatWeekday } from "../../utils/formatDate";

const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const defaultDay = {
    enabled: false,
    startTime: "09:00",
    endTime: "17:00",
    limit: "50"
};

const buildWeek = (schedule = []) => {
    const week = weekDays.reduce((result, day) => ({ ...result, [day]: { ...defaultDay } }), {});

    schedule.forEach((item) => {
        week[item.day] = {
            enabled: true,
            startTime: item.startTime,
            endTime: item.endTime,
            limit: String(item.limit)
        };
    });

    return week;
};

const Schedule = () => {
    const [week, setWeek] = useState(buildWeek());
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadSchedule = async() => {

        try {

            const response = await api.get("/doctors/me/schedule");
            setWeek(buildWeek(response.data.schedule || []));
            setUpcoming(response.data.upcoming || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load schedule");
        }

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedule();
    }, []);

    const updateDay = (day, changes) => {
        setWeek((current) => ({ ...current, [day]: { ...current[day], ...changes } }));
    };

    const handleSave = async() => {
        setError("");
        setMessage("");
        setSaving(true);

        try {

            const schedule = weekDays
                .filter((day) => week[day].enabled)
                .map((day) => ({
                    day,
                    startTime: week[day].startTime,
                    endTime: week[day].endTime,
                    limit: Number(week[day].limit)
                }));

            const response = await api.put("/doctors/me/schedule", { schedule });
            setMessage(response.data.message);
            setWeek(buildWeek(response.data.schedule || []));
            setUpcoming(response.data.upcoming || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to save schedule");
        }

        finally {
            setSaving(false);
        }
    };

    const activeDays = weekDays.filter((day) => week[day].enabled).length;

    if(loading) {
        return <div className="page-loading">Loading schedule...</div>;
    }

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">DOCTOR</span>
                    <h1>My Schedule</h1>
                    <p>Choose the days you see patients and how many appointments you accept each day.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                <div className="table-title">
                    Weekly availability
                    <span className="schedule-count">{activeDays} {activeDays === 1 ? "day" : "days"} selected</span>
                </div>

                <div className="schedule-list">
                    {weekDays.map((day) => (
                        <div className="schedule-row" key={day}>
                            <label className="schedule-day">
                                <input type="checkbox" checked={week[day].enabled} onChange={(event) => updateDay(day, { enabled: event.target.checked })} />
                                <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                            </label>

                            {week[day].enabled ? (
                                <div className="schedule-fields">
                                    <label>From<input type="time" value={week[day].startTime} onChange={(event) => updateDay(day, { startTime: event.target.value })} required /></label>
                                    <label>To<input type="time" value={week[day].endTime} onChange={(event) => updateDay(day, { endTime: event.target.value })} required /></label>
                                    <label>Appointments per day<input type="number" min="1" max="500" value={week[day].limit} onChange={(event) => updateDay(day, { limit: event.target.value })} required /></label>
                                </div>
                            ) : (
                                <span className="schedule-off">Not available</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="schedule-footer">
                    <button className="button button-dark" type="button" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Schedule"}</button>
                </div>
            </div>

            <div className="table-card upcoming-card">
                <div className="table-title">Upcoming days</div>

                {upcoming.length === 0 ? (
                    <div className="schedule-empty">No upcoming days yet. Select your available days above and save, so patients can book appointments with you.</div>
                ) : (
                    <div className="upcoming-grid">
                        {upcoming.map((item) => (
                            <div className="upcoming-item" key={item.date}>
                                <strong>{formatWeekday(item.date)}, {formatDayMonth(item.date)}</strong>
                                <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                <div className="progress-track"><div className="progress-bar" style={{ width: `${Math.min((item.booked / item.limit) * 100, 100)}%` }} /></div>
                                <span>{item.booked} booked · {item.remaining} left of {item.limit}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
