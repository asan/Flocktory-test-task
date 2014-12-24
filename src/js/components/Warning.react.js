var React = require('react');

var Warning =
  React.createClass({
    render:function(){
      return <div className="alert alert-warning app-alert" role="alert">Можно сравнивать не больше 8 компаний.</div>
    }
  });
module.exports = Warning;