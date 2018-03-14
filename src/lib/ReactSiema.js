import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import debounce from "./utils/debounce";
import Frame from "./Frame";
import Slide from "./Slide";

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
    width: 0,
    current: 0
  };

  render() {
    const { children, ...rest } = this.props;
    const { width, current } = this.state;
    const slidesCount = Children.count(children);
    const slideWidth = 100 / slidesCount;

    return (
      <div ref={this.handleSelectorRef} style={{ overflow: "hidden" }}>
        <Frame
          slidesCount={slidesCount}
          width={width}
          {...rest}
          current={current}
          onChange={this.handleFrameChange}
        >
          {Children.map(children, (child, index) => (
            <Slide key={index} child={child} width={slideWidth} />
          ))}
        </Frame>
      </div>
    );
  }

  componentDidMount() {
    const { startIndex, resizeDebounce } = this.props;
    this.setState({
      current: startIndex
    });

    this.handleResize = debounce(() => {
      this.processResize();
    }, resizeDebounce);

    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener(this.handleResize);
  }

  handleFrameChange = data => {
    const slidesCount = Children.count(this.props.children);
    const currentSlide = Math.min(Math.max(data.current, 0), slidesCount - 1);

    this.setState({
      current: currentSlide
    });
  };

  handleSelectorRef = element => {
    this.selector = element;

    this.updateWidth();
  };

  processResize() {
    this.updateWidth();
  }

  updateWidth() {
    this.setState({
      width: this.selector.getBoundingClientRect().width
    });
  }
}

export default ReactSiema;
