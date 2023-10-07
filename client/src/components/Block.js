import React from "react";
import "./Block.css";
const Block = (props) => {
  return (
    <div
      id={`block${props.id}`}
      className="block"
      onClick={() => {
        if (props.onClick) props.onClick();
      }}
    >
      {props.value}
    </div>
  );
};

export default Block;
