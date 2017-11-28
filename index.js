import React, {Component, PropTypes} from 'react'
import { Animated, ScrollView, StyleSheet, Dimensions, View, PanResponder, Image, TouchableWithoutFeedback, TouchableHighlight, Modal, Text } from 'react-native'
import PulsingCircle from './PulsingCircle'

const MAX_ZOOM = 2.5
const ANIMATION_DURATION = 400
const { height, width } = Dimensions.get('window')
const POPUP_COLOR = 'white'

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		flexGrow: 1,
	},

	popupContainer: {
		marginHorizontal: 16,
		backgroundColor: POPUP_COLOR,
		padding: 8,
		borderRadius: 3,
		width: width - 40,
	},

	popupText: {
		fontSize: 17,
	},

	triangle: {
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 6.5,
		borderRightWidth: 6.5,
		borderBottomWidth: 10,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: POPUP_COLOR,
	},
})

class ZoomableImage extends Component {
	constructor(props) {
		super(props)
		this.popupRef = ref => this.popupRef = ref
		this.showPopup = this.showPopup.bind(this)
		this.state = {
			scale: new Animated.Value(1),
			inZoomedState: false,
			isZooming: false,
			offsetX: 0,
			offsetY: 0,
			popupY: 0,
			popupX: 0,
			popupArrowX: 0,
			arrowDirection: 'down',
			modalVisible: false,
		}
		this.onImagePress = this.onImagePress.bind(this)
		this.initValues = this.initValues.bind(this)
		this.closeModal = this.closeModal.bind(this)

		this.onMoveShouldSetPanResponder = this.onMoveShouldSetPanResponder.bind(this)
		this.onPanResponderMove = this.onPanResponderMove.bind(this)
		this.onPanResponderRelease = this.onPanResponderRelease.bind(this)
		this.onPanResponderTerminate = this.onPanResponderTerminate.bind(this)
		this.onPanResponderGrant = this.onPanResponderGrant.bind(this)

		this.trueFunction = () => true
		this.falseFunction = () => false
		this.previousDistanceX = 0
		this.previousDistanceY = 0

		this.imageRef = ref => this.imageRef = ref
		this.popupContentRef = ref => this.popupContentRef = ref
	}


	componentWillMount() {
		this.state.scale.addListener(this.initValues)
		this.initPanResponder()
	}

	initValues ({ value }) {
		this.scale = value
		let offsetX = (this.props.imageWidth / 2 - this.locationX ) * this.scale
		let offsetY = (this.props.imageHeight / 2 - this.locationY ) * this.scale
		const maxOffsetY = this.props.imageHeight * (this.scale -1) / 2
		const maxOffsetX = this.props.imageWidth * (this.scale -1) / 2

		this.offsetY = Math.abs(offsetY) > maxOffsetY ? (offsetY > 0 ? maxOffsetY : -maxOffsetY) : offsetY
		this.offsetX = Math.abs(offsetX) > maxOffsetX ? (offsetX > 0 ? maxOffsetX: -maxOffsetX ) : offsetX
		this.setState({
			offsetX: this.offsetX,
			offsetY: this.offsetY,
		})
	}

	initPanResponder () {
		const config = {
			onStartShouldSetPanResponder: this.trueFunction,
			onStartShouldSetPanResponderCapture: this.falseFunction,
			onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
			onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponder,
			onPanResponderMove: this.onPanResponderMove,
			onPanResponderTerminationRequest: this.trueFunction,
			onPanResponderRelease: this.onPanResponderRelease,
			onPanResponderTerminate: this.onPanResponderTerminate,
			onShouldBlockNativeResponder: this.trueFunction,
			onPanResponderGrant: this.onPanResponderGrant,
		}
		this.panResponder = PanResponder.create(config)
	}

	onPanResponderGrant (e, s) {
		this.previousDistanceX = 0
		this.previousDistanceY = 0
		this.previousScale = this.state.scale._value
		if (s.numberActiveTouches === 2) {
      const dx = Math.abs(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX)
      const dy = Math.abs(e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY)
      const distance = Math.sqrt(dx * dx + dy * dy)
      this.distance = distance
    }
	}

	onMoveShouldSetPanResponder (e, s) {
		return s.numberActiveTouches === 2 || (this.state.inZoomedState && !this.state.isZooming)
	}

	onPanResponderMove (e, s) {
		// zoom
		if (s.numberActiveTouches === 2) {
      const dx = Math.abs(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX)
      const dy = Math.abs(e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY)
      const distance = Math.sqrt(dx * dx + dy * dy)
      let scale = distance / this.distance * this.previousScale
			if ( scale < 1 ) {
				this.setState({ inZoomedState: false })
				scale = 1
			} else if ( scale > MAX_ZOOM) {
				this.setState({ inZoomedState: true })
			}
			Animated.timing(
				this.state.scale,
				{
					toValue: scale,
					duration: 1,
					useNativeDrive: true,
				}
			).start()
    } else if (s.numberActiveTouches === 1) {
			const distanceMovedX = s.dx - this.previousDistanceX
			const distanceMovedY = s.dy - this.previousDistanceY
			this.previousDistanceX = s.dx
			this.previousDistanceY = s.dy
			let offsetX = this.state.offsetX + distanceMovedX
			let offsetY = this.state.offsetY + distanceMovedY
			const maxOffsetY = this.props.imageHeight * (this.scale -1) / 2
			const maxOffsetX = this.props.imageWidth * (this.scale -1) / 2
			this.locationX = this.locationX - distanceMovedX / this.previousScale
			this.locationY = this.locationY - distanceMovedY / this.previousScale
			this.offsetY = Math.abs(offsetY) > maxOffsetY ? (offsetY > 0 ? maxOffsetY : -maxOffsetY) : offsetY
			this.offsetX = Math.abs(offsetX) > maxOffsetX ? (offsetX > 0 ? maxOffsetX: -maxOffsetX ) : offsetX
			this.setState({
				offsetX: this.offsetX,
				offsetY: this.offsetY,
			})
		}
	}

	onPanResponderRelease (e, state) {
	}

	onPanResponderTerminate () {

	}

	normalizeAnnotation (annotation) {
		if (!annotation)
			return
		const x1 = annotation.x1 * this.props.imageWidth / 100
		const x2 = annotation.x2 * this.props.imageWidth / 100
		const y1 = annotation.y1 * this.props.imageHeight / 100
		const y2 = annotation.y2 * this.props.imageHeight / 100
		return { x1, x2, y1, y2 }
	}

	getAnnotation (x, y) {
		let match
		this.props.annotations && this.props.annotations.every(annotation => {
			const { x1, x2, y1, y2  } = this.normalizeAnnotation(annotation)
			if ( x > x1 && x < x2 && y > y1 && y < y2  )
				match = annotation
			return !match
		})
		return match
	}

	showPopup () {
		this.setState({ modalVisible: true })
	}

	onImagePress (e) {
		const { nativeEvent: { locationX = 0, locationY = 0, pageX, pageY } = {}  } = e
		this.currentAnnotation = this.getAnnotation(locationX, locationY)
		if (this.currentAnnotation && !this.state.inZoomedState) {
			this.setState({
				popupY: pageY,
			})
			this.locationX = locationX
			this.locationY = locationY
			this.pageX = pageX
			this.pageY = pageY
			this.zoomUpImage()
		}
		else if (this.state.inZoomedState)
			this.zoomDownImage()
	}

	zoomUpImage () {
		this.setState({ isZooming: true })
		Animated.timing(
			this.state.scale,
			{
				toValue: MAX_ZOOM,
				duration: ANIMATION_DURATION,
				useNativeDrive: true,
			}
		).start(() => {
				this.setState({ inZoomedState: true, isZooming: false  })
				if (this.currentAnnotation)
					this.showPopup()
			}
		)
	}

	zoomDownImage () {
		this.setState({ isZooming: true })
		Animated.timing(
			this.state.scale,
			{
				toValue: 1,
				duration: ANIMATION_DURATION,
				useNativeDrive: true,
			}
		).start(() => this.setState({ inZoomedState: false, offsetX: 0, offsetY: 0, isZooming: false  }))
	}

	closeModal () {
		this.setState({ modalVisible: false })
	}

	renderTouchpoints () {
		if (this.state.isZooming || this.state.inZoomedState)
			return null
		return this.props.annotations && this.props.annotations.map(annotation => {
			const style = {
				position: 'absolute',
				left: ((annotation.x2 + annotation.x1) / 200) * this.props.imageWidth,
				top: ((annotation.y2 + annotation.y1) / 200) * this.props.imageHeight,
			}
			return (<View pointerEvents='none' style= {style}>
				<PulsingCircle pulse />
			</View>)
		})
	}

	popupContent () {
		return (<View style={ { position: 'absolute', top: (this.props.imageHeight / 2) - this.locationY + this.pageY } }>
			<View style={ [ styles.triangle, { marginLeft: width / 2 - 20} ] }/>
			<View ref={ this.popupContentRef }  style={ [ styles.popupContainer, this.props.popOverStyles ] }>
				<Text style= { styles.popupText }>{ this.currentAnnotation && this.currentAnnotation.description }</Text>
			</View>
		</View>)
	}

	popupContainer () {
		const backgroundColorStyle = { opacity: 0.3, flexGrow: 1 }
		return (<Modal
				transparent
				visible={ this.state.modalVisible }
				hardwareAccelerated
			>
			<View style={ styles.container }>
				<Animated.View style={ backgroundColorStyle }>
					<TouchableHighlight
						style={ styles.overlay }
						onPress={ this.closeModal }
						underlayColor='transparent'
					>
						<View />
					</TouchableHighlight>
				</Animated.View>
				{ this.popupContent() }
			</View>
		</Modal>)
	}

	render() {
		const tansformStyles = { transform: [
			{ scale: this.state.scale },

		] }
		return (
			<View style={ { maxHeight: this.props.imageHeight, width: this.props.imageWidth, backgroundColor: 'pink' }} >
			{this.popupContainer()}
				<ScrollView
					style={ { maxHeight: this.props.imageHeight, width: this.props.imageWidth, backgroundColor: 'pink' } }
					{ ...this.panResponder.panHandlers }
					bounces={ false }
					scrollEventThrottle={15}
				>
					<TouchableWithoutFeedback
						onPress={ this.onImagePress }
						style= { { height: this.props.imageHeight, width: this.props.imageWidth, backgroundColor: 'red' } }
					>
						<Animated.Image
							ref={ this.imageRef }
							source={ this.props.source }
							style={ [ tansformStyles, { height: this.props.imageHeight, width: this.props.imageWidth, top: this.state.offsetY , left: this.state.offsetX } ] }
						/>
					</TouchableWithoutFeedback>

			  </ScrollView>
				{ this.renderTouchpoints() }
			</View>
		)
	}
}

ZoomableImage.propTypes = {
  imageWidth: PropTypes.number.isRequired,
  imageHeight: PropTypes.number.isRequired,
  source: PropTypes.object.isRequired,
};
export default ZoomableImage
