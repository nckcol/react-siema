import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import debounce from "./utils/debounce";
import transformProperty from "./utils/transformProperty";

class ReactSiema extends Component {
  static propTypes = {
    resizeDebounce: PropTypes.number,
    duration: PropTypes.number,
    easing: PropTypes.string,
    perPage: PropTypes.number,
    startIndex: PropTypes.number,
    draggable: PropTypes.bool,
    threshold: PropTypes.number,
    loop: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ]),
    onInit: PropTypes.func,
    onChange: PropTypes.func
  };

  static defaultProps = {
    resizeDebounce: 250,
    duration: 200,
    easing: "ease-out",
    perPage: 1,
    startIndex: 0,
    draggable: true,
    threshold: 20,
    loop: false,
    onInit: () => {},
    onChange: () => {}
  };

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
    width: 0,
    current: 0
  };

  componentDidMount() {
    this.setState({
      current: this.props.startIndex
    });

    this.onResize = debounce(() => {
      this.resize();
      this.slideToCurrent();
    }, this.props.resizeDebounce);

    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener(this.onResize);
  }

  resolveSlidesNumber() {
    if (typeof this.props.perPage === "number") {
      this.perPage = this.props.perPage;
    } else if (typeof this.props.perPage === "object") {
      this.perPage = 1;
      for (let viewport in this.props.perPage) {
        if (window.innerWidth > viewport) {
          this.perPage = this.props.perPage[viewport];
        }
      }
    }
  }

  prev() {
    const childrenCount = Children.count(this.props.children);

    this.setState(state => {
      if (state.current === 0 && this.props.loop) {
        return {
          current: childrenCount - this.perPage
        };
      }

      return {
        current: Math.max(state.current - 1, 0)
      };
    });

    this.props.onChange.call(this);
  }

  next() {
    const childrenCount = Children.count(this.props.children);

    this.setState(state => {
      if (state.current === childrenCount - this.perPage && this.props.loop) {
        return {
          current: 0
        };
      }

      return {
        current: Math.min(state.current + 1, childrenCount - this.perPage)
      };
    });
    this.props.onChange.call(this);
  }

  goTo(index) {
    const childrenCount = Children.count(this.props.children);
    const currentSlide = Math.min(Math.max(index, 0), childrenCount - 1);
    this.setState({
      current: currentSlide
    });
    this.props.onChange.call(this);
  }

  resize() {
    this.resolveSlidesNumber();
    this.setSelectorWidth();
  }

  getFrameTransition() {
    const dragging = this.state.dragging;

    const defaultTransition = `all ${this.props.duration}ms ${
      this.props.easing
    }`;
    const draggingTransition = `all 0ms ${this.props.easing}`;
    return dragging ? draggingTransition : defaultTransition;
  }

  getFrameTransform() {
    const dragging = this.state.dragging;

    const defaultTransform = `translate3d(-${Math.round(
      this.state.current * (this.state.width / this.perPage)
    )}px, 0, 0)`;

    const draggingTransform = `translate3d(${(this.state.current *
      (this.state.width / this.perPage) +
      (this.state.startPoint.x - this.state.endPoint.x)) *
      -1}px, 0, 0)`;

    return dragging ? draggingTransform : defaultTransform;
  }

  getFrameStyles() {
    const childrenCount = Children.count(this.props.children);
    const transform = this.getFrameTransform();
    const transition = this.getFrameTransition();
    const dragging = this.state.dragging;

    return {
      width: `${this.state.width / this.perPage * childrenCount}px`,
      cursor: dragging ? "-webkit-grabbing" : "-webkit-grab",
      WebkitTransition: transition,
      transition,
      transform
    };
  }

  getSlideStyles() {
    const childrenCount = Children.count(this.props.children);

    return {
      float: "left",
      width: `${100 / childrenCount}%`
    };
  }

  render() {
    this.resolveSlidesNumber();

    const frameStyles = this.getFrameStyles();
    const slideStyles = this.getSlideStyles();

    return (
      <div
        ref={this.handleSelectorRef}
        style={{ overflow: "hidden" }}
        // onTouchStart={this.handleTouchStart}
        // onTouchEnd={this.handleTouchEnd}
        // onTouchMove={this.handleTouchMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
      >
        <div style={frameStyles}>
          {Children.map(this.props.children, (child, index) =>
            React.cloneElement(child, {
              key: index,
              style: slideStyles
            })
          )}
        </div>
      </div>
    );
  }

  handleSelectorRef = element => {
    this.selector = element;

    this.setState({
      width: this.selector.getBoundingClientRect().width
    });
  };

  updateAfterDrag(startPoint, endPoint) {
    const movement = endPoint.x - startPoint.x;

    if (movement > 0 && movement > this.props.threshold) {
      this.prev();
    } else if (movement < 0 && movement < -this.props.threshold) {
      this.next();
    }
  }

  findCurrentSlide(startPoint, endPoint) {
    const movement = endPoint.x - startPoint.x;

    const posibbleSlideNumber =
      this.state.current - movement / (this.state.width / this.perPage);
    const posibbleSlideTruncated = Math.trunc(posibbleSlideNumber);

    let posibbleSlide = posibbleSlideTruncated;

    const diff = posibbleSlideNumber - posibbleSlideTruncated;

    if ((movement < 0 && diff > 0.2) || (movement > 0 && diff > 0.8)) {
      posibbleSlide += 1;
    }

    const childrenCount = Children.count(this.props.children);

    const currentSlide = Math.min(
      Math.max(posibbleSlide, 0),
      childrenCount - this.perPage
    );

    return currentSlide;
  }

  handleTouchStart = e => {
    e.stopPropagation();
    this.pointerDown = true;
    this.drag.start = e.touches[0].pageX;
  };

  handleTouchEnd = e => {
    e.stopPropagation();
    this.pointerDown = false;
    this.setStyle(this.sliderFrame, {
      WebkitTransition: `all ${this.props.duration}ms ${this.props.easing}`,
      transition: `all ${this.props.duration}ms ${this.props.easing}`
    });
    if (this.drag.end) {
      this.updateAfterDrag();
    }
    this.clearDrag();
  };

  handleTouchMove = e => {
    e.stopPropagation();
    if (this.pointerDown) {
      this.drag.end = e.touches[0].pageX;

      this.setStyle(this.sliderFrame, {
        WebkitTransition: `all 0ms ${this.props.easing}`,
        transition: `all 0ms ${this.props.easing}`,
        [transformProperty]: `translate3d(${(this.currentSlide *
          (this.selectorWidth / this.perPage) +
          (this.drag.start - this.drag.end)) *
          -1}px, 0, 0)`
      });
    }
  };

  handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();

    const point = {
      x: e.pageX,
      y: e.pageY
    };

    this.setState({
      startPoint: point,
      endPoint: point,
      dragging: true
    });
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

    this.setState({
      endPoint: point
    });
  };

  handleMouseUp = e => {
    e.stopPropagation();

    const current = this.findCurrentSlide(
      this.state.startPoint,
      this.state.endPoint
    );
    //this.updateAfterDrag(this.state.startPoint, this.state.endPoint);

    this.setState({
      current,
      dragging: false
    });
  };

  handleMouseLeave = e => {
    if (!this.state.dragging) {
      return;
    }

    const endPoint = {
      x: e.pageX,
      y: e.pageY
    };

    const { startPoint } = this.state;

    const current = this.findCurrentSlide(startPoint, endPoint);

    //this.updateAfterDrag(startPoint, endPoint);

    this.setState({
      current,
      dragging: false
    });
  };
}

export default ReactSiema;
