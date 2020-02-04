import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount() {
        const socket = new WebSocket( (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/api');
        socket.onopen = (event) => {
            console.log('opened', event);
            socket.send('Hello Server!');
        };
        socket.onmessage = (event) => {
            const value = JSON.parse(event.data);
            console.log(value);
            if (value.result) {
                const calced = value.result.split(':');
                let values = this.state.values;
    
                if (values instanceof Object) {
                    values[calced[0]] = calced[1];
                } else {
                    values = {};
                    values[calced[0]] = calced[1];
                }
                this.setState({values});
            }

            if (value.number) {
                let indexes = this.state.seenIndexes;
                const idx = indexes.findIndex(result => result.number === value.number);
                if (idx === -1) {
                    indexes.push(value);
                    indexes.sort((a,b) => a.number > b.number ? 1 : (a.number < b.number ? -1 : 0));
                    this.setState({ seenIndexes: indexes});
                }
            }
        };
        socket.onclose = (event) => {
            console.log('Closed socket', event);
        };
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({values: values.data});
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        await axios.put('/api/values', {
            index: this.state.index
        });
        const value = {number: parseInt(this.state.index)};
        let indexes = this.state.seenIndexes;
        const idx = indexes.findIndex(result => result.number === value.number);
        if (idx === -1) {
            indexes.push(value);
            indexes.sort((a,b) => a.number > b.number ? 1 : (a.number < b.number ? -1 : 0));
            this.setState({ seenIndexes: indexes});
        }
        this.setState({ index: '' });
    }

    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }

    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index: </label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
};

export default Fib;