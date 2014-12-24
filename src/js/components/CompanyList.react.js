var React = require('react');

var CompanyActions = require('../actions/CompanyActions');

var CompanyList =
  React.createClass({
    render:function(){
      var comp = this.props.companies;
      var selected = this.props.selected;
      var todos = [];

      for (var key in comp) {
        todos.push(
          <li key={comp[key].id} className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={key in selected}
                onChange={this._onToggle(key)}
              />
              &nbsp;{comp[key].title}
            </label>
          </li>);
      }
      if(!todos.length){
        return (
          <span>Загрузка...</span>
        )
      }
      return (
          <ul>{todos}</ul>
      )
      
    },
    _onToggle: function(id) {
      return function() {
        CompanyActions.toggleComplete(id);
      }
    }
  });
module.exports = CompanyList;

