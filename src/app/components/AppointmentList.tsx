    import React from 'react';
    import {
        Clock, User,
        Phone,
        CheckCircle,
        XCircle, FileText
    } from 'lucide-react';
    import { Appointment } from './types';

    interface Props<T> {
        appointments: Appointment[];
        onStatusChange: (id: number, status: string) => void;
    }

    export default function AppointmentList<T>({ appointments, onStatusChange }: Props<T>) {
        const statusLabels: Record<string, string> = {
            PENDING: "Ожидает",
            CONFIRMED: "Подтверждён",
            COMPLETED: "Завершён",
            CANCELLED: "Отменён",
        };

        const statusBadgeClass: Record<string, string> = {
            PENDING: "badge-pending",
            CONFIRMED: "badge-confirmed",
            COMPLETED: "badge-completed",
            CANCELLED: "badge-cancelled",
        };




        return (<div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
            {appointments.map((appt) => (
                <div
                    key={appt.id}
                    className="glass-panel"
                    style={{
                        padding: "1.5rem",
                        borderLeft: `3px solid ${appt.status === "CONFIRMED"
                                ? "var(--color-accent)"
                                : appt.status === "COMPLETED"
                                    ? "var(--color-primary)"
                                    : appt.status === "CANCELLED"
                                        ? "var(--color-danger)"
                                        : "var(--color-warning)"
                            }`,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "1rem",
                        }}
                    >
                        {/* Left side: patient info */}
                        <div style={{ flex: 1, minWidth: "250px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                <Clock
                                    size={14}
                                    style={{ color: "var(--color-accent)" }}
                                />
                                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                                    {appt.date},{appt.time}
                                </span>
                                <span
                                    className={`badge ${statusBadgeClass[appt.status]}`}
                                >
                                    {statusLabels[appt.status]}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "0.35rem",
                                }}
                            >
                                <User
                                    size={14}
                                    style={{ color: "var(--text-muted)" }}
                                />
                                <span style={{ fontWeight: 600 }}>
                                    {appt.patientName}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "0.35rem",
                                }}
                            >
                                <Phone
                                    size={14}
                                    style={{ color: "var(--text-muted)" }}
                                />
                                <span
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {appt.patientPhone}
                                </span>
                            </div>
                            <div
                                style={{
                                    marginTop: "0.5rem",
                                    fontSize: "0.9rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <strong>Жалоба:</strong> {appt.complaint}
                            </div>
                            {appt.filePath && (
                                <a
                                    href={appt.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.35rem",
                                        marginTop: "0.5rem",
                                        color: "var(--color-accent)",
                                        fontSize: "0.85rem",
                                        textDecoration: "underline",
                                    }}
                                >
                                    <FileText size={14} /> Прикрепленный файл
                                </a>
                            )}
                        </div>

                        {/* Right side: action buttons */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                minWidth: "150px",
                            }}
                        >
                            {appt.status === "PENDING" && (
                                <>
                                    <button
                                        onClick={() =>
                                            onStatusChange(appt.id, "CONFIRMED")
                                        }
                                        className="btn btn-accent"
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <CheckCircle size={14} /> Подтвердить
                                    </button>
                                    <button
                                        onClick={() =>
                                            onStatusChange(appt.id, "CANCELLED")
                                        }
                                        className="btn btn-danger"
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <XCircle size={14} /> Отменить
                                    </button>
                                </>
                            )}
                            {appt.status === "CONFIRMED" && (
                                <>
                                    <button
                                        onClick={() =>
                                            onStatusChange(appt.id, "COMPLETED")
                                        }
                                        className="btn btn-primary"
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <CheckCircle size={14} /> Завершить
                                    </button>
                                    <button
                                        onClick={() =>
                                            onStatusChange(appt.id, "CANCELLED")
                                        }
                                        className="btn btn-danger"
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <XCircle size={14} /> Отменить
                                    </button>
                                </>
                            )}
                            {(appt.status === "COMPLETED" ||
                                appt.status === "CANCELLED") && (
                                    <span
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "var(--text-muted)",
                                            textAlign: "center",
                                        }}
                                    >
                                        Завершено
                                    </span>
                                )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )}
