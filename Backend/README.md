pip install torch==1.13.0+cu116 torchvision==0.14.0+cu116 torchaudio==0.13.0 --extra-index-url https://download.pytorch.org/whl/cu116



nohup gunicorn -c gunicorn_config.py app:app > myapp.log 2>&1 &