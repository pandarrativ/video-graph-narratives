from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import base64
from io import BytesIO
from PIL import Image
import uuid
import os
from maskrcnn import Resnet50

from utils import *

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # max-size: 100 MB
app.config['UPLOAD_VIDEO_FOLDER'] = "./videos"
app.config['UPLOAD_IMAGE_FOLDER'] = "./imgs"
app.config["IMAGE_WIDTH"] = 640
app.config["IMAGE_HEIGHT"] = 360

# app = Flask(__name__)

@app.route('/api/chat', methods=['POST'])
def openai_api():
    user_message = request.json.get('messages')
    boxes = request.json.get("boxes")
    image = request.json.get("image")
    image = process_base64_image(image)
    # make image into base64
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    encoded_image = base64.b64encode(buffer.getvalue())
    base64_string = encoded_image.decode('utf-8')
    
    # print(eval(boxes))
    messages = parse_boxes_to_messages(boxes, user_message, base64_string)
    resp = chat_completion(messages)
    print(resp)

    return jsonify({"resp":resp})


@app.route("/api/imageupload", methods=["POST"])
def upload_image():
    image, filename = request.json.get("image"), str(uuid.uuid4()) + '.png'
    image = process_base64_image(image)
    image.save(os.path.join(app.config['UPLOAD_IMAGE_FOLDER'], filename))

    return jsonify({'filename': filename}), 200


@app.route("/api/videoupload", methods=["POST"])
def upload_video():
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']

    # If the user does not select a file, the browser submits an
    if file.filename == '':
        return 'No selected file', 400

    if file:
        # filename = secure_filename(file.filename)
        filename = str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
        file.save(os.path.join(app.config['UPLOAD_VIDEO_FOLDER'], filename))
        return jsonify({'filename': filename}), 200

@app.route("/api/segmentation", methods=["POST"])
def instance_segmentation():
    image, filename = request.json.get("image"), str(uuid.uuid4()) + '.png'
    image = process_base64_image(image)
    image.save("ttt.png")
    res = Resnet50.get_instance_segmentations(image=image)
    # print(res)
    return jsonify({"seg_info":res}), 200
    
    # if image_path:
    #     res = Resnet50.get_instance_segmentations(image_path=image_path)
    #     return jsonify({"seg_info":res}), 200
    # else:
    #     return "Image not found! Upload Image first!", 400

@app.route("/api/scene-graph", methods=["POST"])
def get_scene_graph_image():
    image = request.json.get("image")
    image = process_base64_image(image)
    # make image into base64
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    encoded_image = base64.b64encode(buffer.getvalue())
    base64_string = encoded_image.decode('utf-8')
    
    status, data = get_scene_graph_relation(base64_string)
#     data = """{
#     "objects": [
#         {"name": "child", "id": 0},
#         {"name": "VR headset", "id": 1},
#         {"name": "girl", "id": 2}
#     ],
#     "attributes": [
#         {"attribute": "wearing", "object": 0},
#         {"attribute": "holding", "object": 0},
#         {"attribute": "looking up", "object": 0},
#         {"attribute": "standing", "object": 0},
#         {"attribute": "observing", "object": 2},
#         {"attribute": "behind", "object": 2}
#     ],
#     "relationships": [
#         {"predicate": "wears", "subject": 0, "object": 1},
#         {"predicate": "is behind", "subject": 2, "object": 0}
#     ]
# } """
    # data = "'sceneData':{'objects': [{'name': 'child_with_vr_headset', 'id': 0}, {'name': 'vr_headset', 'id': 1}, {'name': 'child_behind', 'id': 2}, {'name': 'indoor_environment', 'id': 3}], 'attributes': [{'attribute': 'wearing', 'object': 0}, {'attribute': 'looking_up', 'object': 0}, {'attribute': 'standing', 'object': 0}, {'attribute': 'equipped', 'object': 1}, {'attribute': 'visible_face', 'object': 2}, {'attribute': 'indoor', 'object': 3}], 'relationships': [{'predicate': 'wearing', 'subject': 0, 'object': 1}, {'predicate': 'in_front_of', 'subject': 0, 'object': 2}, {'predicate': 'contains', 'subject': 3, 'object': 0}, {'predicate': 'contains', 'subject': 3, 'object': 2}]}"
    print(str(status), data)

    # return jsonify({'data':data})
    if status == 200:
        return jsonify({'data': data}), 200
    else:
        return data, 500
    # G = nx.DiGraph()

    # # Add objects as nodes
    # for obj in data['objects']:
    #     G.add_node(obj['id'], label=obj['name'])

    # # Add attributes as nodes and edges from objects to attributes
    # for attr in data['attributes']:
    #     attr_node = f"{attr['attribute']}_{attr['object']}"
    #     G.add_node(attr_node, label=attr['attribute'])
    #     G.add_edge(attr['object'], attr_node)

    # # Add edges for relationships
    # for rel in data['relationships']:
    #     G.add_edge(rel['subject'], rel['object'], label=rel['predicate'])

    # # Drawing the graph
    # pos = nx.spring_layout(G)  # Positions for all nodes
    # nx.draw(G, pos, with_labels=False)

    # # Draw node labels
    # node_labels = nx.get_node_attributes(G, 'label')
    # nx.draw_networkx_labels(G, pos, labels=node_labels)

    # # Draw edge labels
    # edge_labels = nx.get_edge_attributes(G, 'label')
    # nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

    # buf = BytesIO()
    # plt.savefig(buf, format='png')
    # buf.seek(0)
    # image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    # return jsonify({'image': image_base64})

def process_base64_image(image_base64):
    # Remove the header part if it exists (e.g., "data:image/png;base64,")
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]

    image_data = base64.b64decode(image_base64)
    image = Image.open(BytesIO(image_data))
    # print(app.config["IMAGE_WIDTH"] , app.config["IMAGE_HEIGHT"])
    image = image.resize((app.config["IMAGE_WIDTH"] , app.config["IMAGE_HEIGHT"] ))
    print(image.size)
    return image

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
