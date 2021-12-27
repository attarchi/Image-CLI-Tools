# Introduction
This is a command line program which is compatible with linux, mac and windows 10.
This program can resize, optimize, and convert image files as single or bulk.


I needed to make changes to multiple image files for multiple times, so I developed this tool with node.js. It works great for me and I use it in my jobs, so I decided to share it with anybody needed this tool. Enjoy it freely and share  your experience with me!

I appriciate **Lovell Fuller and contributors** for developing [sharp package](https://github.com/lovell/sharp) 
. Without their package i woudn't be able to develope this tool.
Thank you guys for making my job easier.

## Responsibility
Please pay attention, ALWAYS make a copy of your images before starting the process. I can't take any responsibility if you lose your images with this tool by making mistake in settings or because of program bugs.

# Usage

***If you already installed node.js and npm on your system, you can use this command for installing and using freely.***


**Usage without installing**:

```bash
$ npx image-cli-tools [options]
```

**Usage after installing** (recommended):

```bash
## install
$ npm i -g image-cli-tools

# usage
$ image-cli-tools [options]
# or
$ image-tools [options]
```


***If you want to run it as standalone you can use a built executable file with pkg***
---
## Installing on windows
- Download the lastest executable version for windows from [here](https://github.com/attarchi/Image-CLI-Tools/releases)
- Extract zip file
- Copy image-cli-tools.exe into your [system root]
    ```shell
    ## windows system root:
    "c:\Windows\"

    ## or 

    "c:\Windows\system32\"
    ```
- Now open your command prompt and enjoy it.
  
# Switches

|Switch|Simple Form|Description|
|--|--|--|
|```--optimize```|-o|Compresses the images to the extent that the quality is not lost|
|```--recursive```|-rd|Searches image files in nested sub-directories based on the query|
|```--percentage```|-p|Used for reducing the size of all images with a certain percenage|
|```--rewrite```|-rw|Saves the changes on the original files|
|```--help```|-h|Shows help|
|```-png```||Converts output file formats to png|
|```-jpeg```|-jpg|Converts output file formats to jpg|
|```-webp```||Converts output file formats to webp|
|```-gif```||Converts output file formats to gif|
|```-tiff```||Converts output file formats to tiff|

# Patameters
- [file query]

    ``` Writes multiple queries for listing batch files with regex query. File query can be relative or absolute. ```
    
    ```bash
        ## Relative Path Query in Windows
        ".\images\*.png"

        ## Absolute Path Query in Windows
        "C:\images\*.png"

        ## Relative Path Query in Linux/mac
        "./images/*.png"

        ## absolute Path Query in Linux/mac
        "/home/Downloads/*.png"
    ```

- out
  
    ``` Output file paths which can be either relative or absolute. Output file path can be relative or absolute. Default: ./modified/```
    
    * Relative output path will be related to input files path; not the current folder.
    * If output path is set to a absolute path, it means that all of the output files are copied in it.
    * This parameter can not be used with --rewrite switch simultaneously.
    
    ```bash
        ## Example of using patameter
        out=./resized/
    ```

- width
    
    ```The exact width of output images in pixel unit.```
    * If you use --percentage switch, this parameter shoud be 1 to 100 percentage
  
    ```bash
        ## Example of using patameter
        width=1024
    ```

- height

    ```This is exactly the same as width parameter```
    * If you use both width and height parameter together, your images might probably be cropped.

    ```bash
        ## Example using with width together
        width=256 height=256
    ```

- maxwidth

    ```The maximum width of output images in pixel unit. Only if your image width is larger than this limitation, your image will be resized othewise it is not affected```

    ```bash
        ## Example
        maxwidth=1024
    ```
- maxheight
- 
    ```This is exactly the same as maxwidth parameter```

    ```bash
        ## Example
        maxheight=1024
    ```

# Features      
## 1- Make Changes By Query
You can makge changes in bulk images by using regex query inorder to identify which of the destination files get affected. Also you can write multiple destination queries.

---------------------------------------------
Examples
---------------------------------------------

### Example 1.1 - Searching In Multiple Folder ###
All png files in Downloads folder and all gif files in usr directory are affected.
```shell
$ image-cli-tools "/home/Downloads/*.png" "/usr/*.gif" [switches and parameters]
```

### Example 1.2 - Searching by Multiple Extention ###
All png,jpg,gif files in Downloads folder and sub-directories are affected (Swich -rd use for searching in nested sub-directories)
```shell
$ image-cli-tools "/home/Downloads/*.png" "/home/Downloads/*.jpg" "/home/Downloads/*.gif" -rd  [switches and parameters]
```

### Example 1.3 - Searching in current directory ###
All png files in **current directory** are affected.
```shell
$ image-cli-tools "./*.png" [switches and parameters]
```


## 2- Resizing images
This tool can resize multiple files simultaneously.

---------------------------------------------
Examples
---------------------------------------------
### Example 2.1 - Resize Based On Fixed Width ###
This method keeps images dimensions ratio.
```shell
$ image-cli-tools /home/Downloads/*.png width=128
```

### Example 2.2 - Resize To Certain Dimensions ###
If you want to resize images to certain dimensions you can use width and height together.
```shell
$ image-cli-tools /home/Downloads/*.png width=128 height=128
```

### Example 2.3 - Resize With Percentage ###
If you want to resize images by percentage you can use width with -p switch together.
```shell
$ image-cli-tools /home/Downloads/*.png width=50 -p
```

### Example 2.4 - Resize By Maximum Dimensions ###
If you want to resize images to limited dimensions you can use maxwidth and/or maxheigth.
```shell
$ image-cli-tools /home/Downloads/*.png maxwidth=128
```


## 3- Convert Image format
This tool can convert png/gif/jpeg/tiff/webp files to eachother.

---------------------------------------------
Examples
---------------------------------------------
### Example 3.1 - Convert TIFF To PNG ###
```shell
$ image-cli-tools "./*.tiff" -png
```

### Example 3.2 - Convert Multiple Image Formats To WEBP ###
```shell
$ image-cli-tools "./*.tiff" "./*.png" "./*.jpg" -webp
```

### Example 3.2 - Convert WEBP To PNG And Move to somewhere else ###

```shell
$ image-cli-tools "./*.webp" -png out=./converted/
```

## 4- Optimize Image size
If you want to optimize your images and save more spaces, you can use (-o) switch.
This switch can be used with any other parameters and switches simultaneously.

---------------------------------------------
Examples
---------------------------------------------
### Example 4.1 - Optimize PNG files ###
```shell
$ image-cli-tools "./*.png" -png
```

### Example 4.2 - Convert PNG To Optimzed Webp ###
```shell
$ image-cli-tools "./*.png" -webp -o
```

# Any Question? Report a Bug? Enhancements?

Please open a new issue on [GitHub](https://github.com/attarchi/Image-CLI-Tools/issues)


# License
Image-CLI-Tools is OpenSource and licensed under the Terms of [Apache License, Version 2.0](https://opensource.org/licenses/Apache-2.0). You're welcome to [contribute](https://github.com/attarchi/Image-CLI-Tools/blob/master/CONTRIBUTE.md)!

    Copyright 2021 Ryan @archi
        Powered by sharp https://github.com/lovell/sharp
        Copyright 2021 Lovell Fuller and contributors.
   