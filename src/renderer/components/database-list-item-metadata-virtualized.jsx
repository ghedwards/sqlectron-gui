import React, { Component, PropTypes } from 'react';
import DatabaseItem from './database-item.jsx';
import ScrollerOffset from './scroller-offset.jsx'
import { VirtualScroll } from 'react-virtualized'
import 'react-virtualized/styles.css';

const STYLE = {
  header: { fontSize: '0.85em', color: '#636363' },
  menu: { marginLeft: '5px' },
  item: { wordBreak: 'break-all', cursor: 'default' },
};


export default class DbMetadataList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array,
    columnsByTable: PropTypes.object,
    triggersByTable: PropTypes.object,
    collapsed: PropTypes.bool,
    database: PropTypes.object.isRequired,
    onExecuteDefaultQuery: PropTypes.func,
    onSelectItem: PropTypes.func,
    onGetSQLScript: PropTypes.func,
    scrollHeight: PropTypes.number.isRequired,
    scrollTop: PropTypes.number.isRequired,
    offsetTop: PropTypes.number.isRequired,
    width: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number]),
  }

  constructor(props, context) {
    super(props, context);
    this.state = {tableheights:{}};

    this.onAdjustHeight = this.onAdjustHeight.bind(this);
    this.rowHeight = this.rowHeight.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.collapsed === undefined) {
      this.setState({ collapsed: !!nextProps.collapsed });
    }
  }

  onAdjustHeight({height, table}){
    let tableheights = this.state.tableheights;
    tableheights[table] = height;
    this.setState({tableheights:tableheights});
    if ( this.metadataScroll ) {
      this.metadataScroll.recomputeRowHeights();
      this.metadataScroll.forceUpdate();
    }

  }

  toggleCollapse() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  renderHeader() {
    const title = this.state.collapsed ? 'Expand' : 'Collapse';
    const cssClass = this.state.collapsed ? 'right' : 'down';

    return (
      <span
        title={title}
        className="header clickable"
        onClick={::this.toggleCollapse}
        style={STYLE.header}>
        <i className={`${cssClass} triangle icon`}></i>
        {this.props.title}
      </span>
    );
  }

  rowHeight({index}) {
    var height = 30, table = this.props.items[index];

    if ( this.state.tableheights[table.name] ) {
      height = this.state.tableheights[table.name] + 30;
    }

    return height;
  }

  renderItem({ index }){
    const {
      onExecuteDefaultQuery,
      onSelectItem,
      items,
      database,
      onGetSQLScript,
    } = this.props;

    const item = items[index];

    const hasChildElements = !!onSelectItem;
  
    const cssStyle = {...STYLE.item};
    if (this.state.collapsed) {
      cssStyle.display = 'none';
    }
    cssStyle.cursor = hasChildElements ? 'pointer' : 'default';

    return (
        <DatabaseItem
          key={item.name}
          database={database}
          item={item}
          dbObjectType={this.props.title.slice(0, -1)}
          style={cssStyle}
          columnsByTable={this.props.columnsByTable}
          triggersByTable={this.props.triggersByTable}
          onAdjustHeight={this.onAdjustHeight}
          onSelectItem={onSelectItem}
          onExecuteDefaultQuery={onExecuteDefaultQuery}
          onGetSQLScript={onGetSQLScript} />
      );

  }

  renderItems() {
    const {
      onExecuteDefaultQuery,
      onSelectItem,
      items,
      database,
      onGetSQLScript,
    } = this.props;

    if (!items || this.state.collapsed) {
      return null;
    }

    if (!items.length) {
      return (
        <span className="ui grey item"><i> No results found</i></span>
      );
    }

    return items.map(item => {
      const hasChildElements = !!onSelectItem;

      const cssStyle = {...STYLE.item};
      if (this.state.collapsed) {
        cssStyle.display = 'none';
      }
      cssStyle.cursor = hasChildElements ? 'pointer' : 'default';

      return (
        <DatabaseItem
          key={item.name}
          database={database}
          item={item}
          dbObjectType={this.props.title.slice(0, -1)}
          style={cssStyle}
          columnsByTable={this.props.columnsByTable}
          triggersByTable={this.props.triggersByTable}
          onSelectItem={onSelectItem}
          onExecuteDefaultQuery={onExecuteDefaultQuery}
          onGetSQLScript={onGetSQLScript} />
      );
    });
  }

  render() {
    const {
      items,
      scrollHeight,
      scrollTop,
      offsetTop,
      width,
    } = this.props;

    return (
      <div className="item">
        {this.renderHeader()}
        <div className="menu" style={STYLE.menu}>
           <ScrollerOffset 
              scrollHeight={scrollHeight} 
              scrollTop={scrollTop} 
              offsetTop={offsetTop}>

              {({ scrollHeight, scrollTop }) => (
                <VirtualScroll
                  ref={(ref) => this.metadataScroll = ref}
                  height={scrollHeight}
                  rowCount={(items&&!this.state.collapsed)?items.length:0}
                  rowHeight={this.rowHeight}
                  rowRenderer={this.renderItem}
                  scrollTop={scrollTop}
                  autoHeight
                  width={width}
                />
              )}
            </ScrollerOffset>
        </div>
      </div>
    );
  }
}
