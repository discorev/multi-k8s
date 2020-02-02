import React, { Component }  from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class OtherPage extends Component {
    handleReset = async (event) => {
        event.preventDefault();

        await axios.delete('/api/values');
        this.props.history.push('/');
    }

    render() {
        return (
            <div>
                Here you can reset the indexes that have been seen / calculated<br />
                <button onClick={this.handleReset}>Reset</button><br />
                <Link to="/">Go back home</Link>
            </div>
        );
    }
}

export default OtherPage;