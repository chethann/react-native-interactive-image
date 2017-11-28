/* eslint react-native/no-color-literals:0 */
import React, { Component } from 'react'
import {
	Animated,
	StyleSheet,
	View } from 'react-native'

const PULSING_INTERVAL = 500
const CIRCLE_RADIUS = 10

const styles = StyleSheet.create({
	circle: {
		height: CIRCLE_RADIUS * 2,
		width: CIRCLE_RADIUS * 2,
		backgroundColor: '#ff1133',
		borderRadius: CIRCLE_RADIUS,
	}
})

class PulsingCircle extends Component {
	constructor (props) {
		super(props)
		this.state = {
			scale: new Animated.Value(1),
		}
	}

	componentDidMount () {
		this.props.pulse && this.cyclicAnimate()
	}

	cyclicAnimate () {
		Animated.sequence([
			Animated.timing(
				this.state.scale, {
				toValue: 1.1,
				duration: PULSING_INTERVAL,
			}),
			Animated.timing(
				this.state.scale, {
				toValue: 1,
				duration: PULSING_INTERVAL,
			}),
		]).start(() => this.cyclicAnimate())
	}

	render () {
		return (<View { ...this.props }>
				<Animated.View style={ [ styles.circle, { transform: [ { scale: this.state.scale } ]   } ] } />
			</View>)
	}

}

PulsingCircle.propTypes = {

}

export default PulsingCircle
