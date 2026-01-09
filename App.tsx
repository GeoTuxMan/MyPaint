import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';

const { height, width } = Dimensions.get('window');

interface IPath {
  path: string;
  color: string;
}

interface IShape {
    type: string;
    color: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

const MyPaint = () => {
  const [paths, setPaths] = useState<(IPath | IShape)[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentShape, setCurrentShape] = useState('freehand');
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentShapeObject, setCurrentShapeObject] = useState<IShape | null>(null);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const shapes = ['freehand', 'line', 'circle', 'rect'];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { x0, y0 } = gestureState;
      if (currentShape === 'freehand') {
        setCurrentPath(`M${x0},${y0}`);
      } else {
        setStartPoint({ x: x0, y: y0 });
        setCurrentShapeObject({
          type: currentShape,
          color: currentColor,
          startX: x0,
          startY: y0,
          endX: x0,
          endY: y0,
        });
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      if (currentShape === 'freehand') {
        setCurrentPath((prevPath) => `${prevPath} L${moveX},${moveY}`);
      } else if (startPoint) {
        setCurrentShapeObject((prevShape) => ({
          ...prevShape!,
          endX: moveX,
          endY: moveY,
        }));
      }
    },
    onPanResponderRelease: () => {
      if (currentShape === 'freehand') {
        if (currentPath) {
          setPaths([...paths, { path: currentPath, color: currentColor, type: 'path' } as IPath]);
          setCurrentPath('');
        }
      } else if (currentShapeObject) {
        setPaths([...paths, currentShapeObject]);
        setCurrentShapeObject(null);
        setStartPoint(null);
      }
    },
  });

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    setCurrentShapeObject(null);
  };
  
  const handleUndo = () => {
      setPaths(paths.slice(0, -1));
  }

  const renderShape = (shape: IPath | IShape, index: number | string) => {
    const shapeObject = shape as IShape;
    switch (shapeObject.type) {
      case 'line':
        return (
          <Line
            key={index}
            x1={shapeObject.startX}
            y1={shapeObject.startY}
            x2={shapeObject.endX}
            y2={shapeObject.endY}
            stroke={shapeObject.color}
            strokeWidth="4"
          />
        );
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(shapeObject.endX - shapeObject.startX, 2) + Math.pow(shapeObject.endY - shapeObject.startY, 2)
        );
        return (
          <Circle
            key={index}
            cx={shapeObject.startX}
            cy={shapeObject.startY}
            r={radius}
            stroke={shapeObject.color}
            strokeWidth="4"
            fill="transparent"
          />
        );
      case 'rect':
        const width = Math.abs(shapeObject.endX - shapeObject.startX);
        const height = Math.abs(shapeObject.endY - shapeObject.startY);
        const x = Math.min(shapeObject.startX, shapeObject.endX);
        const y = Math.min(shapeObject.startY, shapeObject.endY);
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            stroke={shapeObject.color}
            strokeWidth="4"
            fill="transparent"
          />
        );
      default:
        const pathObject = shape as IPath;
        return <Path key={index} d={pathObject.path} stroke={pathObject.color} strokeWidth="4" fill="none" />;
    }
  };
  
  const renderCurrentShape = () => {
    if (!currentShapeObject) return null;
    return renderShape(currentShapeObject, 'current');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyPaint - Drawing app</Text>
      <View style={styles.controls}>
        <View style={styles.buttons}>
          {shapes.map((shape) => (
            <TouchableOpacity
              key={shape}
              style={[styles.button, currentShape === shape && styles.selectedButton]}
              onPress={() => setCurrentShape(shape)}
            >
              <Text style={styles.buttonText}>{shape}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.colors}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.color, { backgroundColor: color }, currentColor === color && styles.selectedColor]}
              onPress={() => setCurrentColor(color)}
            />
          ))}
        </View>
        <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={handleClear}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleUndo}>
              <Text style={styles.buttonText}>Undo</Text>
            </TouchableOpacity>
        </View>
      </View>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg height={height * 0.8} width={width}>
          {paths.map((p, i) => renderShape(p, i))}
          <Path d={currentPath} stroke={currentColor} strokeWidth="4" fill="none" />
          {renderCurrentShape()}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  controls: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  colors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  color: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  canvas: {
    flex: 1,
  },
   actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default MyPaint;