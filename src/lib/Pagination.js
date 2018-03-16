import React, { Component } from "react";

class Pagination extends Component {
  render() {
    const { page, current, count } = this.props;
    const styles = {
      textAlign: "center"
    };

    return (
      <div style={styles}>
        {[...new Array(count)].map((_, index) =>
          React.cloneElement(page, {
            children: index + 1,
            current: current === index,
            onClick: e => this.handleClick(e, index)
          })
        )}
      </div>
    );
  }

  handleClick(e, page) {
    const { pageChange } = this.props;
    pageChange(e, page);
  }
}

export default Pagination;
