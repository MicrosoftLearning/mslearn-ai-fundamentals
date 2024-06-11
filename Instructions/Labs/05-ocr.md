---
lab:
    title: 'Read text in Vision Studio​'
---

# Read text in Vision Studio

In this exercise you'll use Azure AI service to explore the optical character recognition capabilities of Azure AI Vision. You'll use Vision Studio to experiment with extracting text from images, without having to write any code.

A common computer vision challenge is to detect and interpret text embedded within an image. This is known as optical character recognition (OCR). In this exercise you’ll use an Azure AI services resource, which includes Azure AI Vision services. You'll then use Vision Studio to try out OCR with different types of images.

## Create an *Azure AI services* resource

You can use Azure AI Vision's OCR capabilities with an **Azure AI services** multi-service resource. If you haven't already done so, create an **Azure AI services** resource in your Azure subscription.

1. In another browser tab, open the **Azure portal** at [https://portal.azure.com](https://portal.azure.com?azure-portal=true), signing in with the Microsoft account associated with your Azure subscription.

1. Click the **&#65291;Create a resource** button and search for *Azure AI services*. Select **create** an **Azure AI services** plan. You will be taken to a page to create an Azure AI services resource. Configure it with the following settings:
    - **Subscription**: *Your Azure subscription*.
    - **Resource group**: *Select or create a resource group with a unique name*.
    - **Region**: *Select the closest geographical region. If in eastern US, use "East US 2"*.
    - **Name**: *Enter a unique name*.
    - **Pricing tier**: *Standard S0.*
    - **By checking this box I acknowledge that I have read and understood all the terms below**: *Selected*.

1. Select **Review + create** then **Create** and wait for deployment to complete.

## Connect your Azure AI service resource to Vision Studio

Next, connect the Azure AI services resource you provisioned above to Vision Studio.

1. In another browser tab, navigate to **Vision Studio** at [https://portal.vision.cognitive.azure.com](https://portal.vision.cognitive.azure.com?azure-portal=true).

1. Sign in with your account and making sure you are using the same directory as the one where you have created your Azure AI services resource.

1. On the Vision Studio home page, select **View all resources** under the **Getting started with Vision** heading.

    ![The View all resource link is highlighted under Getting started with Vision in Vision Studio.](./media/analyze-images-vision/vision-resources.png)

1. On the **Select a resource to work with** page, hover your mouse cursor over the resource you created above in the list and then check the box to the left of the resource name, then select **Select as default resource**.

    > **Note** : If your resource is not listed, you may need to **Refresh** the page.

    ![The Select a resource to work with dialog is displayed with the cog-ms-learn-vision-SUFFIX Cognitive Services resource highlighted and checked. The Select as default resource button is highlighted.](./media/analyze-images-vision/default-resource.png)

1. Close the settings page by selecting the "x" at the top right of the screen.

## Extract text from images in the Vision Studio
    
1. In a web browser, navigate to **Vision Studio** at [https://portal.vision.cognitive.azure.com](https://portal.vision.cognitive.azure.com?azure-portal=true).

1. On the **Getting started with Vision** landing page, select **Optical character recognition**, and then the **Extract text from images** tile.

1. Under the **Try It Out** subheading, acknowledge the resource usage policy by reading and checking the box.  

1. Select [**https://aka.ms/mslearn-ocr-images**](https://aka.ms/mslearn-ocr-images) to download **ocr-images.zip**. Then open the folder.

1. On the portal, select **Browse for a file** and navigate to the folder on your computer where you downloaded **ocr-images.zip**. Select **advert.jpg** and select **Open**.

1. Now review what is returned:
    - In **Detected attributes**, any text found in the image is organized into a hierarchical structure of regions, lines, and words.
    - On the image, the location of text is indicated by a bounding box, as shown here:

    ![An image of the text in the image outlined.](media/read-text-computer-vision/advert-bounding-boxes.jpg)

1. You can now try another image. Select **Browse for a file** and navigate to the folder where you saved the files from GitHub. Select **letter.jpg**.

    ![An image of a typed letter.](media/read-text-computer-vision/letter.jpg)

1. Review the results of the second image. It should return the text and bounding boxes of the text. If you have time, try **note.jpg** and **receipt.jpg**.

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the **Azure portal** at [https://portal.azure.com](https://portal.azure.com?azure-portal=true) and select the resource group that contains the resource you created.
1. Select the resource and select **Delete** and then **Yes** to confirm. The resource is then deleted.

## Learn more

To learn more about what you can do with this service, see Azure AI Vision's documentation on [optical character recognition](https://learn.microsoft.com/azure/ai-services/computer-vision/overview-ocr).
