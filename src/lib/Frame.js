import React, { Component } from "react";

class Frame extends Component {
  state = {
    startPoint: {
      x: 0,
      y: 0
    },
    endPoint: {
      x: 0,
      y: 0
    },
    dragging: false,
    current: 0
  };

  render() {
    const styles = this.getStyles();

    return (
      <div
        style={styles}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
      >
        {this.props.children}
      </div>
    );
  }

  getTransition() {
    const { dragging } = this.state;
    const { duration, easing } = this.props;

    const transition = `all ${duration}ms ${easing}`;
    const draggingTransition = `all 0ms ${easing}`;

    return dragging ? draggingTransition : transition;
  }

  getTransform() {
    const { dragging, startPoint, endPoint } = this.state;
    const { width, current, perPage } = this.props;

    const offset = current * (width / perPage);
    const movement = dragging ? startPoint.x - endPoint.x : 0;

    return `translate3d(${-Math.round(offset + movement)}px, 0, 0)`;
  }

  getStyles() {
    const { slidesCount, width, perPage } = this.props;
    const { dragging } = this.state;
    const transform = this.getTransform();
    const transition = this.getTransition();

    return {
      transform,
      transition,
      WebkitTransition: transition,
      width: `${width / perPage * slidesCount}px`,
      cursor: dragging ? "-webkit-grabbing" : "-webkit-grab"
    };
  }

  handleDragStart(point) {
    this.setState({
      startPoint: point,
      endPoint: point,
      dragging: true
    });
  }

  handleDrag(point) {
    this.setState({
      endPoint: point
    });
  }

  handleDragEnd(point) {
    const currentSlide = this.findCurrentSlide(this.state.startPoint, point);

    this.props.onChange({
      current: currentSlide
    });

    this.setState({
      dragging: false
    });
  }

  findCurrentSlide(startPoint, endPoint) {
    const movement = endPoint.x - startPoint.x;
    const { current } = this.props;

    const { perPage, width } = this.props;

    const offset = this.getSlideOffsetWithSnap(movement, perPage / width);

    return current + offset;
  }

  getSlideOffsetWithSnap(movement, slideRatio) {
    const maxSnap = 0.2;
    const LEFT = -1;
    const RIGHT = 1;

    const direction = Math.sign(movement);

    const offset = -movement * slideRatio;
    const wholeOffset = Math.floor(offset);

    const snapCloseness = offset - wholeOffset;

    if (
      (direction === LEFT && snapCloseness > maxSnap) ||
      (direction === RIGHT && snapCloseness > 1 - maxSnap)
    ) {
      return wholeOffset + 1;
    }

    return wholeOffset;
  }

  handleTouchStart = e => {
    e.stopPropagation();

    const point = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };

    this.handleDragStart(point);
  };

  handleTouchEnd = e => {
    e.stopPropagation();

    this.handleDragEnd(this.state.endPoint);
  };

  handleTouchMove = e => {
    e.stopPropagation();

    if (!this.state.dragging) {
      return;
    }

    const point = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };

    this.handleDrag(point);
  };

  handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();

    const point = {
      x: e.pageX,
      y: e.pageY
    };

    this.handleDragStart(point);
  };

  handleMouseMove = e => {
    e.preventDefault();

    if (!this.state.dragging) {
      return;
    }

    const point = {
      x: e.pageX,
      y: e.pageY
    };

    this.handleDrag(point);
  };

  handleMouseUp = e => {
    e.stopPropagation();

    this.handleDragEnd(this.state.endPoint);
  };

  handleMouseLeave = e => {
    if (!this.state.dragging) {
      return;
    }

    const endPoint = {
      x: e.pageX,
      y: e.pageY
    };

    this.handleDragEnd(endPoint);
  };
}

export default Frame;
