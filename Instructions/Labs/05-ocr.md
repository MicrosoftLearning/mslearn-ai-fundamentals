---
lab:
    title: 'Read text in Azure AI Foundry portal​'
---

# Read text in Azure AI Foundry portal

In this exercise you'll use Azure AI service to explore the optical character recognition capabilities of Azure AI Vision. You'll use Vision Studio to experiment with extracting text from images, without having to write any code.

A common computer vision challenge is to detect and interpret text embedded within an image. This is known as optical character recognition (OCR). In this exercise you’ll use an Azure AI services resource, which includes Azure AI Vision services. 

In this exercise, you will use Azure AI Vision in Azure AI Foundry portal, Microsoft's platform for creating intelligent applications, to extract text from images. 

## Create a project in Azure AI Foundry portal

1. In a browser tab, navigate to [Azure AI Foundry](https://ai.azure.com?azure-portal=true).

1. Sign in with your account. 

1. On the Azure AI Foundry portal home page, select **Create a project**. In Azure AI Foundry, projects are containers that help organize your work.  

    ![Screenshot of Azure AI Foundry home page with create a project selected.](./media/azure-ai-foundry-home-page.png)

1. On the *Create a project* pane, you will see a generated project name, which you can keep as-is. Depending on whether you have created a hub in the past, you will either see a list of *new* Azure resources to be created or a drop-down list of existing hubs. If you see the drop-down list of existing hubs, select *Create new hub*, create a unique name for your hub, and select *Next*.  
 
    ![Screenshot of the create a project pane with automaticly generated names for hub and project.](./media/azure-ai-foundry-create-project.png)

> **Important**: You will need an Azure AI services resouce provisioned in a specific location to complete the rest of the lab.

1. In the same *Create a project* pane, select **Customize** and select one of the following **Locations**: East US, France Central, Korea Central, West Europe, or West US to complete the rest of the lab. Then select **create**. 

1. Take note of the resources that are created: 
- Azure AI services
- Azure AI hub
- Azure AI project
- Storage account
- Key vault
- Resource group  
 
1. After the resources are created, you will be brought to your project's *Overview* page. On the left-hand menu on the screen, select **AI Services**.
 
    ![Screenshot of the left-hand menu on the project screen with AI Services selected.](./media/azure-ai-foundry-ai-services.png)  

1. On the *AI Services* page, select the *Vision + Document* tile to try out Azure AI Vision and Document capabilities.

    ![Screenshot of the Vision and Document tile selected on the AI Services page.](./media/vision-document-tile.png)

## Extract text from images 
    
1. On the *Vision + Document* page, scroll down and select **Image** and then select the **Optical character recognition** tile. 

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
