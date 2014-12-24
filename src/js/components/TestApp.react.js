var React = require('react');

var CompanyActions = require('../actions/CompanyActions');
var CompanyStore = require('../stores/CompanyStore');

var CompanyList = require('./CompanyList.react');
var CompanyPlot = require('./CompanyPlot.react');

function getCompaniesState() {
  return {
    companies: CompanyStore.getAll(),
    selected: CompanyStore.getSelected()
  };
}


var APP =
  React.createClass({
    getInitialState: function() {
      return getCompaniesState();
    },

    componentDidMount: function() {
      CompanyStore.addChangeListener(this._onChange);
      CompanyActions.fetch();
      
    },

    componentWillUnmount: function() {
      CompanyStore.removeChangeListener(this._onChange);
    },
    _onChange: function() {
      this.setState(getCompaniesState());
    },
    render:function(){
      return <div>
              <div className="col-md-6">
                <CompanyList companies={this.state.companies} selected={this.state.selected} />
              </div>
              <div className="col-md-6">
                <CompanyPlot selected={this.state.selected} width={500} />
              </div>
            </div>
    },
    _onToggle: function(id) {
      return function() {
        CompanyActions.toggleComplete(id);
      }
    }
  });
module.exports = APP;

