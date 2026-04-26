import sys
from PIL import Image

def remove_white_background(input_path, output_path, tolerance=220):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of white)
            # to transparent
            if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    remove_white_background("public/logo.png", "public/logo.png")
