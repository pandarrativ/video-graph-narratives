from dotenv import load_dotenv
import os
import openai
import re
import base64
import requests
import json
import networkx as nx
import matplotlib.pyplot as plt


load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


def parse_boxes_to_messages(boxes, messages, base64_image):
    res = "You are a learning agent about the images from the conseration with user. These are the boxes in the pictures. Format: <region i>: [x1, y1, width, height]. \n"
    for i in range(len(boxes)):
        res += boxes[i]['name'] + ": " + str(boxes[i]["box"]) + " \n"
    messages.insert(0, {"role":"system", "content":res})
    messages[-1] = {"role":"user", "content": [
                {
                "type": "text",
                "text": messages[-1]["content"],
                },
                {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]
        }
    # print(res)
    return messages

def chat_completion(messages):
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    payload = {
    "model": "gpt-4-vision-preview",
    "messages": messages,
    "max_tokens": 300
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    return response.json()["choices"][0]["message"]



def get_scene_graph_relation(base64_image):
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
        {"role": "system","content":"These are the boxes in the pictures. Format: <region i>: [x1, y1, width, height]. \n<region 0>: [84, 100, 111, 186] \n<region 1>: [358, 120, 116, 143] \n"},
        {"role":"user", "content": [
            {
            "type": "text",
            "text": """Give me the objects, relationships of entities in this image. Objects should be ordered lexicographically. If there are several objects with the same name, add a number to the end of name to differentiate (such as name:child_0, name:child_1). And also return the image size in px. Format the responses in JSON, following this example structure:
            
            Example format:
                {{
                    objects: [
                        {name: STRING, id: INT, box_areas:{x1:INT, y1:INT, width:INT, height:INT}},
                    ],
                    relationships: [
                        {predicate: STRING, object: INT, subject: INT},
                    ],
                    image_size:{width:INT, height:INT}
                }}"""
            },
            {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
            }
        ]
        },
    ],
    "max_tokens": 700
    }

    # response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    res = """{
    "objects": [
        {"name": "Left Child", "id": 1, "box_areas": {}},
        {"name": "SLP", "id": 2, "box_areas": {}},
        {"name": "Tyson", "id": 3, "box_areas": {}},
        {"name": "Tyson's shoe", "id": 4, "box_areas": {}},
        {"name": "story", "id": 5, "box_areas": {}},
        {"name": "setting", "id": 6, "box_areas": {}},
        {"name": "narrative", "id": 7, "box_areas": {}},
        {"name": "kitchen", "id": 8, "box_areas": {}},
        {"name": "breakfast", "id": 9, "box_areas": {}},
        {"name": "visual cues", "id": 10, "box_areas": {}}
    ],
    "relationships": [
        {"predicate": "participated in", "object": 1, "subject": 5},
        {"predicate": "focused on", "object": 1, "subject": 3},
        {"predicate": "required prompts by", "object": 1, "subject": 2},
        {"predicate": "included", "object": 1, "subject": 6},
        {"predicate": "contributed to", "object": 1, "subject": 7},
        {"predicate": "looked for", "object": 1, "subject": 4},
        {"predicate": "displayed", "object": 1, "subject": 10},
        {"predicate": "went to", "object": 3, "subject": 8},
        {"predicate": "ate", "object": 3, "subject": 9}
    ]
}
"""

    # res = response.json()["choices"][0]["message"]["content"]

    print(res)
    print("----------------------------------------------------------")
    try:
        data = parse_scene_json(res)
        return 200, data
    except Exception as e:
        print(e)
        return 500, "Model Failed: " + res


def parse_scene_json(res):
    first_index = res.find("{")
    last_index = res.rfind("}")
    if first_index == -1:
        raise Exception("Not an JSON Object")
    res = res[first_index:last_index + 1]
    # return json.loads(res)
    return res