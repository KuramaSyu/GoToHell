import requests
import json

def main():
    endpoint = "http://localhost:3001"
    resource = "/t/DSC04345.jpg"
    url = endpoint + resource
    response = requests.get(url)
    if response.status_code == 200:
        with open("DSC04345.jpg", "wb") as f:
            f.write(response.content)
        print("Image downloaded successfully.")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")

if __name__ == "__main__":
    main()