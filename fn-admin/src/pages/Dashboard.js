import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const fleetData = [
    {
      id: "#233",
      routeNo: "6",
      driver: "Johann Lobo",
      location: "Urwa, Mangalore",
      routeType: "Pickup",
      status: "Inactive",
    },
    {
      id: "#234",
      routeNo: "7",
      driver: "Ayman Sheikh",
      location: "Northen Sky, Pumpwell",
      routeType: "Pickup",
      status: "Active",
    },
    {
      id: "#231",
      routeNo: "5",
      driver: "Ashwin M V",
      location: "Moodibidri",
      routeType: "Outreach",
      status: "Inactive",
    },
    {
      id: "#236",
      routeNo: "10",
      driver: "Gladlin Mascarenhas",
      location: "Northen Sky, Pumpwell",
      routeType: "Drop",
      status: "Active",
    },
  ];

  useEffect(() => {
    let active = 0;
    let inactive = 0;
    fleetData.forEach((vehicle) => {
      if (vehicle.status === "Active") active++;
      else if (vehicle.status === "Inactive") inactive++;
    });
    setActiveCount(active);
    setInactiveCount(inactive);
  }, []);

  return (
    <>
      <div className="top-bar">
        <Link
          to="#"
          className="square"
          style={{
            margin: "auto 1rem",
            cursor: "default",
            backgroundColor: "rgb(137, 149, 145)",
          }}
        >
          Dashboard
        </Link>
        <Link to="#" className="square" style={{ margin: "auto 1rem" }}>
          Live Tracking
        </Link>
        <Link to="/reports" className="square" style={{ margin: "auto 1rem" }}>
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
            <h2>Fleet Activity Status</h2>
            <div
              style={{
                display: "inline-flex",
                columnGap: "30px",
                flexWrap: "wrap",
                marginLeft: "1.3rem",
              }}
            >
              <div
                className="activity-square"
                style={{
                  backgroundColor: "#53ff40",
                  color: "#0d5a17",
                  borderColor: "#0d5a17",
                }}
              >
                <p>Active Vehicles</p>
                <p style={{ fontSize: "20px" }}>{activeCount}</p>
              </div>
              <div
                className="activity-square"
                style={{
                  backgroundColor: "#f35050",
                  color: "#8d0b0b",
                  borderColor: "#8d0b0b",
                }}
              >
                <p>Inactive Vehicles</p>
                <p style={{ fontSize: "20px" }}>{inactiveCount}</p>
              </div>
            </div>

            <div style={{ width: "100%", maxWidth: "1900px" }}>
              <h2>Map Overview</h2>
              <div
                style={{
                  aspectRatio: "4 / 1.8",
                  position: "relative",
                  margin: "0 2% 0",
                }}
              >
                <iframe
                  src="https://maps.google.com/maps?q=st+joseph+vamanjoor&amp;output=embed"
                  loading="lazy"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                ></iframe>
              </div>
            </div>

            <div>
              <h2>Fleet</h2>
              <table
                id="fleetTable"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "2px double black",
                  color: "white",
                  textAlign: "center",
                  margin: "1rem",
                }}
              >
                <thead style={{ backgroundColor: "#001F54" }}>
                  <tr>
                    <th>Vehicle ID</th>
                    <th>Route No</th>
                    <th>Driver Assigned</th>
                    <th>Current Location</th>
                    <th>Type of route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetData.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.id}</td>
                      <td>{vehicle.routeNo}</td>
                      <td>{vehicle.driver}</td>
                      <td>{vehicle.location}</td>
                      <td>{vehicle.routeType}</td>
                      <td>
                        <li
                          style={{
                            color:
                              vehicle.status === "Active"
                                ? "#53ff40"
                                : "#e52323",
                          }}
                        >
                          {vehicle.status}
                        </li>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
