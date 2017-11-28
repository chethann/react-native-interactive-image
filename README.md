# react-native-interactive-image

An interactive image component for React Native. 
Acceps a lits of annotations with normalized x and y positions and displayes annotated interactive image. 

# Demo
![react-native-interactive-image Demo](https://github.com/chethann/demo-images/blob/master/demo-interactive-image.gif)

# Usage

```javascript
<ZoomableImage
					source={ require('./test.jpg') }
					imageHeight={ 600 }
					imageWidth={ 450 }
					annotations={ annotations }
					popOverStyles={ { backgroundColor: 'white' } }
/>
}
```

Where annotaions is a list of annotation which needs to be displayed, x and y postions are calculated taking mean of x1, x1 and y1, y2. An annotation is clickable within this region. Annotations used in demo:

```javascript
const annotations = [
	{
		x1: 25,
		x2: 35,
		y1: 20,
		y2: 30,
		description: 'A pair of black running sports shoes, has lace-up detail. Textile and mesh upper',
	},
	{
		x1: 60,
		x2: 70,
		y1: 15,
		y2: 25,
		description: 'Shoe sole tip!',
	},
	{
		x1: 20,
		x2: 30,
		y1: 50,
		y2: 60,
		description: 'Textured and patterned outsole',
	},
	{
		x1: 65,
		x2: 75,
		y1: 65,
		y2: 75,
		description: 'Textured outsole with a stacked heel',
	},
]
```

### Installation
- `npm install --save react-native-interactive-image`

License
----
MIT





