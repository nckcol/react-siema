import React, { Component } from "react";

class Slide extends Component {
  render() {
    const { child } = this.props;
    const styles = this.getStyles();

    return React.cloneElement(child, {
      style: styles
    });
  }

  getStyles() {
    const { width } = this.props;

    return {
      float: "left",
      width: `${width}%`
    };
  }
}

export default Slide;
