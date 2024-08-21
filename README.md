# React Flow Kafka Topology Visualization

This project is a React application that visualizes Kafka consumer and topic topologies using `react-flow-renderer`. The application allows users to dynamically create, edit, and delete Kafka consumers (referred to as "workers") and Kafka topics, providing a visual interface to manage the relationships between these elements.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [License](#license)

## Introduction

This application provides a visual tool to manage Kafka topics and consumers. The visualized graph allows you to add, delete, and edit both workers and topics, as well as the connections between them. The layout of the graph can be adjusted dynamically, and the configurations can be saved to mimic a backend Kafka configuration structure.

## Features

- **Dynamic Node Addition**: Add new Kafka consumers (workers) and topics.
- **Dynamic Edge Creation**: Establish relationships between workers and topics through draggable edges.
- **Node and Edge Editing**: Modify the labels of nodes and delete nodes or edges directly from the UI.
- **Layout Management**: Adjust the layout of the graph with both vertical and horizontal orientations.
- **Customizable Layout**: Use sliders to control the separation between nodes and ranks in the layout.
- **Save Configuration**: Generate and log a JSON structure representing the current graph state.

## Project Structure

The project structure is simple and revolves around the main `FlowApp` component:

```docs
src/
│
├── App.css # Styling for the application
├── App.js # Main entry point of the React application
└── index.js # Entry point for ReactDOM
```


## Installation

To install and run this project locally, follow these steps:

1. **Clone the Repository**

    ```bash
    git clone https://github.com/bogdancstrike/kafka-workers-visualizer
    cd kafka-workers-visualizer
    ```

2. **Install Dependencies**

    Use npm or yarn to install the project dependencies:

    ```bash
    npm install
    ```

## Running the Application

Once the dependencies are installed, you can start the development server:

```bash
npm start
```

## Usage

- **Add Worker**: 
  - Click on the "Add Worker" button to create a new Kafka consumer node (referred to as "worker").
  - The new worker node will be positioned randomly within the canvas area.

- **Add Topic**:
  - Click on the "Add Topic" button to create a new Kafka topic node.
  - The new topic node will be positioned randomly within the canvas area.

- **Create Connections**:
  - Drag from the handle (small circle) on the side of a node to another node to create an edge (connection).
  - Connections can only be made between workers and topics.

- **Edit Labels**:
  - Click on the label of any node to edit its name.
  - The label field is an input box that allows for direct editing.

- **Delete Nodes or Edges**:
  - To delete a node (worker or topic), click the red "×" button located in the top-right corner of the node.
  - To delete an edge, click on the "Delete" text that appears along the edge.

- **Adjust Layout**:
  - Click on the "Vertical Layout" button to arrange the graph in a top-to-bottom (TB) direction.
  - Click on the "Horizontal Layout" button to arrange the graph in a left-to-right (LR) direction.
  - Use the sliders to adjust the separation between nodes (Node Separation) and between rows/columns (Rank Separation).

- **Save Configuration**:
  - Click on the "Save" button to log the current configuration of nodes and edges as a JSON object in the console.
  - The JSON object will represent the topology as a list of worker nodes, each with associated input and output topics.

## License

This project is licensed under the **MIT** License.
