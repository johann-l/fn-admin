import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const expenses = {
    total: 1000,
    categories: [
      { label: "Fuel", amount: 250, color: "#4a90e2" },
      { label: "Highway", amount: 250, color: "#50e3c2" },
      { label: "Services", amount: 250, color: "#f5a623" },
      { label: "Misc", amount: 250, color: "#bd10e0" },
    ],
  };

  const [vehicleExpenses] = useState([
    { bus: "Bus No 1", amount: 3000 },
    { bus: "Bus No 2", amount: 5000 },
    { bus: "Bus No 3", amount: 2000 },
    { bus: "Bus No 4", amount: 1000 },
  ]);

  const total = Object.values(expenses).reduce((a, b) => a + b, 0);

  const percent = (val) => (total > 0 ? (val / total) * 100 : 0);

  const pieData = {
    labels: vehicleExpenses.map((e) => e.bus),
    datasets: [
      {
        data: vehicleExpenses.map((e) => e.amount),
        backgroundColor: ["#c70000", "#45acce", "orange", "#9ccc65"],
      },
    ],
  };

  return (
    <div className="reports-page">
      <div className="top-bar">
        <Link to="/" className="square" style={{ margin: "auto 1rem" }}>
          Dashboard
        </Link>
        <Link to="#" className="square" style={{ margin: "auto 1rem" }}>
          Live Tracking
        </Link>
        <Link
          to="#"
          className="square"
          style={{
            margin: "auto 1rem",
            cursor: "default",
            backgroundColor: "rgb(137, 149, 145)",
          }}
        >
          Reports
        </Link>
        <p className="square" style={{ margin: "auto 14rem auto auto" }}>
          ... 4 ...
        </p>
      </div>

      <div className="layout">
        <h1 className="logo">FleetNow</h1>
        <aside className="sidebar">
          <ul
            style={{
              paddingTop: "50%",
              fontFamily: "Poppins,sans-serif",
              fontSize: "x-large",
            }}
          >
            <li>Notifications</li>
            <li style={{ padding: "2rem 0" }}>
              Main boards
              <ul style={{ fontSize: "large" }}>
                <li>Drivers board</li>
                <li>Passenger board</li>
              </ul>
            </li>
            <li style={{ padding: "2rem 0" }}>
              Manage
              <ul style={{ fontSize: "large" }}>
                <li>Drivers</li>
                <li>Passengers</li>
                <li>Routes</li>
                <li>Documents</li>
                <li>Payments</li>
              </ul>
            </li>
          </ul>
        </aside>

        <div className="content">
          <main className="main">
            <h2>Reports</h2>

            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                marginLeft: "1.3rem",
              }}
            >
              {/* Total Expenses */}
              <div
                style={{
                  display: "inline-block",
                  flexWrap: "wrap",
                  marginRight: "3rem",
                }}
              >
                {" "}
                <div className="report-container">
                  <h3>Total Expenses</h3>
                  <div style={{ paddingLeft: "1rem" }}>
                    <h2>₹{expenses.total}</h2>
                    <p>Expense Allocation</p>

                    <div id="graph-bar">
                      {expenses.categories.map((cat, index) => (
                        <div
                          key={index}
                          style={{
                            width: `${(cat.amount / expenses.total) * 100}%`,
                            backgroundColor: cat.color,
                          }}
                        ></div>
                      ))}
                    </div>

                    <ul
                      className="expense-divisions"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        columnGap: "3rem",
                      }}
                    >
                      {expenses.categories.map((cat, index) => (
                        <li key={index}>
                          {cat.label}
                          <br />₹{cat.amount}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Vehicles */}
                <div className="report-container">
                  <h3>Vehicles</h3>
                  <div style={{ display: "flex", paddingLeft: "1rem" }}>
                    <Pie
                      data={pieData}
                      options={{
                        responsive: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />

                    <table style={{ marginLeft: "3rem" }}>
                      <tbody>
                        <tr>
                          <td>
                            <div className="square">
                              <ul>
                                <li>Bus No 1</li>
                              </ul>
                              <p>₹3000</p>
                            </div>
                          </td>
                          <td>
                            <div className="square">
                              <ul>
                                <li>Bus No 2</li>
                              </ul>
                              <p>₹5000</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="square">
                              <ul>
                                <li>Bus No 3</li>
                              </ul>
                              <p>₹2000</p>
                            </div>
                          </td>
                          <td>
                            <div className="square">
                              <ul>
                                <li>Bus No 4</li>
                              </ul>
                              <p>₹1000</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div style={{ marginLeft: "0rem" }}>
                <div className="trans-hist">
                  <h3>Transaction History</h3>
                  <div
                    style={{
                      maxHeight: "2.7rem",
                      overflowY: "scroll",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      paddingBottom: "85.4%",
                    }}
                  >
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="square"
                        style={{ display: "flex", margin: "0.5rem" }}
                      >
                        <img
                          src="/indianoil.png"
                          alt="IndianOil"
                          style={{ width: "60px", paddingRight: "2rem" }}
                        />
                        <div>
                          <strong>Bus number 7</strong>
                          <br />
                          Fuel: 12 Ltrs &nbsp;&nbsp; Fuel rate: ₹100/-
                          <br />
                          <small>27 February 2025</small>
                        </div>
                        <div style={{ marginLeft: "auto", fontWeight: "bold" }}>
                          ₹1,200.00
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Reports;
