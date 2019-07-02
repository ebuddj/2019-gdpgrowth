import React, {Component} from 'react';
import style from './../styles/styles.less';

// http://recharts.org/
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, CartesianAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// https://underscorejs.org/
import _ from 'underscore';

// https://alligator.io/react/axios-react/
import axios from 'axios';

const order = {
  'Africa':3,
  'Asia':4,
  'Europe':0,
  'N. America':1,
  'Oceania':5,
  'S. America':2
};

let data;
let interval;

class App extends Component {
  constructor() {
    super();

    this.state = {
      active_continents:['Africa','Asia','Europe','N. America','Oceania','S. America'],
      animation_duration:500,
      data:[],
      year:1961
    }
  }
  componentDidMount() {
    let self = this;
    axios.get('./data/data.json', {
    })
    .then(function (response) {
      data = response.data;
      self.updateData();
      interval = setInterval(() => {
        if (self.state.year >= 2017) {
          self.setState((state, props) => ({
            year:1961
          }), self.updateData);
        }
        else {
          self.setState((state, props) => ({
            year:state.year + 1
          }), self.updateData);
        }
      }, 800);
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  componentWillReceiveProps(props) {

  }
  getCountryColor(continent) {
    let continentColors = {
      'Africa':'rgba(230, 25, 75, 1)',
      'Asia':'rgba(60, 180, 75, 1)',
      'Europe':'rgba(245, 130, 49, 1)',
      'N. America':'rgba(128, 0, 0, 1)',
      'Oceania':'rgba(240, 50, 230, 1)',
      'S. America':'rgba(0, 0, 117, 1)'
    }
    return continentColors[continent];
  }
  updateData() {
    let current_data = [];
    _.each(_.sortBy(data.filter((value, index, arr) => {
      if (this.state.active_continents.includes(value.continent)) {
        return value;
      }
    }), (country) => {
      return order[country.continent];
    }), (country, i) => {
      let value = null;
      if (country[this.state.year] && country[this.state.year - 1] && country[this.state.year + 1]) {
        value = (country[this.state.year] + country[this.state.year - 1] + country[this.state.year + 1]) / 3;
      }
      else if (country[this.state.year] && country[this.state.year - 1]) {
        value = (country[this.state.year] + country[this.state.year - 1]) / 2;
      }
      else if (country[this.state.year] && country[this.state.year + 1]) {
        value = (country[this.state.year] + country[this.state.year + 1]) / 2;
      }
      else if (country[this.state.year]) {
        value = country[this.state.year];
      }
      current_data.push({
        fill:this.getCountryColor(country.continent),
        name:country.country,
        x:i,
        y:value
      });
    });
    this.setState((state, props) => ({
      data:current_data
    }));
  }
  sliderChange(event) {
    clearInterval(interval);
    this.setState((state, props) => ({
      animation_duration:50,
      year: event.target.valueAsNumber
    }), this.updateData);
  }
  selectContinent(continent) {
    clearInterval(interval);
    if (this.state.active_continents.includes(continent) === true) {
      this.setState((state, props) => ({
        active_continents:this.state.active_continents.filter((value, index, arr) => { if (value !== continent) return value; })
      }), this.updateData);
    }
    else {
      this.setState((state, props) => ({
        active_continents:this.state.active_continents.concat(continent)
      }), this.updateData);
    }
  }
  render() {
    return (
      <div className={style.app}>
        <h3>Annual GDP growth percent per country in <span>{this.state.year}</span></h3>
        <input className={style.slider} type="range" min={1961} max={2017} value={this.state.year} onChange={() => this.sliderChange(event)}/>
        <legend>
          <div>Filter by continent</div>
          <span onClick={() => this.selectContinent('Europe')} className={style.europe} style={this.state.active_continents.includes('Europe') ? {opacity: 1} : {}}>Europe</span>
          <span onClick={() => this.selectContinent('N. America')} className={style.n_america} style={this.state.active_continents.includes('N. America') ? {opacity: 1} : {}}>N. America</span>
          <span onClick={() => this.selectContinent('S. America')} className={style.s_america} style={this.state.active_continents.includes('S. America') ? {opacity: 1} : {}}>S. America</span>
          <span onClick={() => this.selectContinent('Africa')} className={style.africa} style={this.state.active_continents.includes('Africa') ? {opacity: 1} : {}}>Africa</span>
          <span onClick={() => this.selectContinent('Asia')} className={style.asia} style={this.state.active_continents.includes('Asia') ? {opacity: 1} : {}}>Asia</span>
          <span onClick={() => this.selectContinent('Oceania')} className={style.oceania} style={this.state.active_continents.includes('Oceania') ? {opacity: 1} : {}}>Oceania</span>
        </legend>
        <ResponsiveContainer width="100%" height={500} step={1} className={style.line_chart_container}>
          <ScatterChart margin={{top: 0, right: 0, bottom: 0, left: 0}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <YAxis type="number" dataKey="y" name="growth" unit="%" domain={[-20, 30]} interval="preserveStartEnd" ticks={[-20,-10,-5,0,5,10,20,30]} hide={false} allowDataOverflow={true} allowDecimals={false} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
              return [props.payload.name + ': ' + value.toLocaleString()];
            }}/>
            <Scatter isAnimationActive={true} animationDuration={this.state.animation_duration} name="" data={this.state.data} onClick={(props) => {
            }}/>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
export default App;
