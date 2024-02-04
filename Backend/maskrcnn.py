import torch
from torchvision import transforms
from PIL import Image
from torchvision.models.detection import maskrcnn_resnet50_fpn

class Resnet50:
    COCO_CLASS_NAMES = [
        '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
        'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'N/A', 'stop sign',
        'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
        'elephant', 'bear', 'zebra', 'giraffe', 'N/A', 'backpack', 'umbrella', 'N/A', 'N/A',
        'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
        'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
        'bottle', 'N/A', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
        'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
        'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'N/A', 'dining table',
        'N/A', 'N/A', 'toilet', 'N/A', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
        'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'N/A', 'book',
        'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
    ]
    # Load the pre-trained Mask R-CNN model
    model = maskrcnn_resnet50_fpn(pretrained=True)
    model.eval()  # Set the model to evaluation mode
    # Transform the image to a tensor
    transform = transforms.Compose([
        transforms.ToTensor(),
    ])
    confidence_threshold = 0.5 # Set a threshold for detection confidence

    @staticmethod
    def get_instance_segmentations(image):
        image = image.convert("RGB")
        # image = Image.open(image_path).convert("RGB")
        image_tensor = Resnet50.transform(image)
        image_tensor = image_tensor.unsqueeze(0)

        # If you have a GPU with CUDA, transfer the model to the GPU
        if torch.cuda.is_available():
            model = model.cuda()
            image_tensor = image_tensor.cuda()

        # Perform the prediction
        with torch.no_grad():
            prediction = Resnet50.model(image_tensor)
        res = []
        count = 0
        for i in range(len(prediction[0]['boxes'])):
            score = prediction[0]['scores'][i].numpy().tolist()
            if score > Resnet50.confidence_threshold:
                box = prediction[0]['boxes'][i].numpy().tolist()
                label = prediction[0]['labels'][i].numpy().tolist()
                # mask = prediction[0]['masks'][i].numpy().tolist()
                res.append({"id":count, "label_int":label, "label":Resnet50.COCO_CLASS_NAMES[label], "score":score, "box":box})
                count += 1
                
        return res

