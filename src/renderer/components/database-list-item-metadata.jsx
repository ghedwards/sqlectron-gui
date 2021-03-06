import React, { Component, PropTypes } from 'react';
import DatabaseItem from './database-item.jsx';
import ScrollerOffset from './scroller-offset.jsx'
import { VirtualScroll } from 'react-virtualized'

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
  }

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.collapsed === undefined) {
      this.setState({ collapsed: !!nextProps.collapsed });
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

      const cssStyle = { ...STYLE.item };
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
                  height={scrollHeight}
                  rowCount={items?items.length:0}
                  rowHeight={30}
                  rowRenderer={this.renderItem.bind(this)}
                  scrollTop={scrollTop}
                  autoHeight
                  width={100}
                />
              )}
            </ScrollerOffset>
        </div>
      </div>
    );
  }
}
