import React from "react";

function DirectionsList({ stepsList }: { stepsList: any }) {
    // if (!routeData || !routeData.trips || routeData.trips.length === 0) {
    //     console.log("NO ROUTE DATA");
    //   return <div>No route available</div>;
    // }
  
    // const steps = routeData.trips[0].legs.flatMap((leg: any) => leg.steps);
    console.log("Steps List:", stepsList);

    let tripInstructions = '';
    for (const step of stepsList) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
    }
    // instructions.innerHTM

    return (
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 10,
          maxHeight: "50%",
          width: "300px",
          overflowY: "scroll",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
              
        <h3>Directions</h3>
        <ol style={{ paddingLeft: "20px" }}>
        {stepsList.map((step: any, index: number) => (
          <li key={index}>
            <p>{step.maneuver.instruction}</p>
            <small>Distance: {(step.distance / 1000).toFixed(2)} km</small>
          </li>
        ))}
      </ol>
    </div>
    );
  }
  
  

export default DirectionsList;
