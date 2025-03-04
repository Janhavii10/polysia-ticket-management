import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Container, Row, Col, Form, Button } from "react-bootstrap";
import { Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";

import "../../styles/stats.css"; // Import external CSS

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Stats = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ tickets: [], users: [] });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default: current year

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/stats");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    // Calculate stats
    const totalTickets = data.tickets.length;
    const closedTickets = data.tickets.filter(ticket => ticket.status === "Closed").length;
    const totalAgents = data.users.filter(user => user.role === "Agent").length;
    const totalEmployees = data.users.filter(user => user.role === "Employee").length;

    // Filter tickets for selected year
    const ticketsByMonth = Array(12).fill(0);
    data.tickets.forEach(ticket => {
        const ticketDate = new Date(ticket.created_at);
        if (ticketDate.getFullYear() === selectedYear) {
            ticketsByMonth[ticketDate.getMonth()] += 1;
        }
    });

    // Chart Data for Line Chart
    const chartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Tickets Submitted",
                data: ticketsByMonth,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
            },
        ],
    };

    // Extract ticket categories and count occurrences
    const categoryCounts = {};
    data.tickets.forEach(ticket => {
        categoryCounts[ticket.category] = (categoryCounts[ticket.category] || 0) + 1;
    });

    // Chart Data for Pie Chart
    const pieChartData = {
        labels: Object.keys(categoryCounts),
        datasets: [
            {
                data: Object.values(categoryCounts),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#BA68C8", "#FFA726"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#BA68C8", "#FFA726"]
            }
        ]
    };

    return (
        <Container fluid className="mt-4">

            {/* Back Button */}
            <div className="stats-container">
                <div className="back-button-container">
                    <Button className="button" onClick={() => navigate("/dashboard-admin")}>
                        Back
                    </Button>
                </div>
            </div>


            {/* Ticket Stats */}
            <Row className="mt-3">
                {[
                    { title: "All Tickets", value: totalTickets, color: "allticket" },
                    { title: "Closed Tickets", value: closedTickets, color: "closedticket" },
                    { title: "Total Agents", value: totalAgents, color: "totalagent" },
                    { title: "Total Employees", value: totalEmployees, color: "totalemp" },
                ].map((stat, index) => (
                    <Col key={index} md={3}>
                        <Card className={`stats-card ${stat.color}`}>
                            <div className="stats-content">
                                <div>
                                    <h5>{stat.title}</h5>
                                    <h2 className="stat-value">{stat.value}</h2>
                                </div>
                                <i className="bi bi-bar-chart-fill stats-icon"></i>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Ticket Analytics Charts */}
            <Row className="mt-4">
                {/* Line Chart for Ticket Trends */}
                <Col md={6} className="chart-column">
                    <Card className="full-width-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Ticket Trends</h4>
                                <Form.Select
                                    className="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {[2025, 2024, 2023].map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                            {ticketsByMonth.every(count => count === 0) ? (
                                <p className="text-center mt-4">No data available</p>
                            ) : (
                                <div className="chart-container">
                                    <Line data={chartData} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Pie Chart for Ticket Categories */}
                <Col md={6} className="chart-column">
                    <Card className="full-width-card">
                        <Card.Body>
                            <h4>Tickets by Category</h4>
                            {Object.keys(categoryCounts).length === 0 ? (
                                <p className="text-center mt-4">No data available</p>
                            ) : (
                                <div className="pie-chart-container">
                                    <Pie data={pieChartData} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
        </Container>
    );
};

export default Stats;
