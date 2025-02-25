# Download all images given by
#
#       `https://randomuser.me/api/portraits/${
#         Math.random() > 0.5 ? "women" : "men"
#       }/${Math.floor(Math.random() * 100)}.jpg`
#

import requests
import os

def download_image(url, filename):
    response = requests.get(url)
    with open(filename, 'wb') as file:
        file.write(response.content)

def main():
    dst = "../public/dummy_images"
    os.mkdir(dst)
    os.mkdir(os.path.join(dst, "men"))
    os.mkdir(os.path.join(dst, "women"))
    os.makedirs(dst, exist_ok=True)
    for i in range(100):
        for g in ["men", "women"]:
            url = f"https://randomuser.me/api/portraits/{g}/{i}.jpg"
            filename = os.path.join(dst, g, f"{i}.jpg")
            download_image(url, filename)
            print(f"Downloaded {url} to {filename}")

if __name__ == "__main__":
    main()