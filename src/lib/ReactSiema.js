import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import debounce from "./utils/debounce";
import Frame from "./Frame";
import Slide from "./Slide";
import Pagination from "./Pagination";

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
    onChange: PropTypes.func,
    pagination: PropTypes.bool,
    renderPage: PropTypes.func
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
    onChange: () => {},
    pagination: false,
    page: <button />
  };

  state = {
    width: 0,
    current: 0
  };

  render() {
    const { children, pagination, page, ...rest } = this.props;
    const { perPage } = this.props;
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
        {pagination && (
          <Pagination
            page={page}
            current={current}
            count={slidesCount - perPage + 1}
            pageChange={this.handlePageChange}
          />
        )}
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
    this.setState({
      current: this.normalizeCurrent(data.current)
    });
  };

  handlePageChange = (e, page) => {
    this.setState({
      current: this.normalizeCurrent(page)
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

  normalizeCurrent(slide) {
    const { perPage } = this.props;
    const slidesCount = Children.count(this.props.children);
    return Math.min(Math.max(slide, 0), slidesCount - perPage);
  }
}

export default ReactSiema;
