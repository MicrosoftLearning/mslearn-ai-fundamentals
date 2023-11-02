---
lab:
    title: 'Detect faces in Vision Studio​'
---

# Detect faces in Vision Studio

Vision solutions often require AI to be able to detect human faces. Suppose the fictitious retail company Northwind Traders wants to locate where customers are standing in a store to best assist them. One way to accomplish this is to determine if there are any faces in the images, and if so, to return the bounding box coordinates that show their location.

To test the face detection capabilities of the Azure AI Face service, you will use [Azure Vision Studio](https://portal.vision.cognitive.azure.com/). This is a UI-based platform that lets you explore Azure AI Vision features without needing to write any code.

## Create an *Azure AI services* resource

You can use the Azure AI Face service with an **Azure AI services** multi-service resource. If you haven't already done so, create an **Azure AI services** resource in your Azure subscription.

1. In another browser tab, open the Azure portal at [https://portal.azure.com](https://portal.azure.com?azure-portal=true), signing in with your Microsoft account.

1. Select **&#65291;Create a resource** and search for Azure AI services. Then create an Azure AI services resource with the following settings:
    - Subscription: *Your Azure subscription*.
    - Resource group: *Select or create a resource group*.
    - Region: East US.
    - Name: *Enter a unique name.*
    - Pricing tier: *FO (if available, otherwise select SO.)*
    - Responsible AI Notice: *Select to confirm*.

1. Select **Review + create** then **Create** and wait for deployment to complete.

## Connect your Azure AI service resource to Vision Studio

1. In another browser tab, navigate to [**Vision Studio**](https://portal.vision.cognitive.azure.com?azure-portal=true). 

1. Sign in with your account and making sure you are using the same directory as the one where you have created your Azure AI services resource.

1. On the Vision Studio home page, select **View all resources** under the **Getting started with Vision** heading.

    ![The View all resource link is highlighted under Getting started with Vision in Vision Studio.](./media/analyze-images-vision/vision-resources.png)

4. On the **Select a resource to work with** page, hover your mouse cursor over the resource you created above in the list and then check the box to the left of the resource name, then select **Select as default resource**.

    > **Note** : If your resource is not listed, you may need to **Refresh** the page.

    ![The Select a resource to work with dialog is displayed with the cog-ms-learn-vision-SUFFIX Cognitive Services resource highlighted and checked. The Select as default resource button is highlighted.](./media/analyze-images-vision/default-resource.png)

## Detect faces in the Vision Studio 

1. Select **Vision Studio** to return to the Get Started with Vision page, and then select **Face** to display the Detect Faces in an image panel. Select **Try it out**.

1. Select the checkbox to acknowledge the message about resource usage.

1. Select each of the sample images and observe the face detection data that is returned.

1. Select [**https://aka.ms/mslearn-detect-faces**](https://aka.ms/mslearn-detect-faces) to download **detect-faces.zip**. Then open the folder on your computer.

1. Upload **store-camera-1.jpg** (shown below) and review the face detection details that are returned.

    ![An image of people in a store.](./media/create-face-solutions/store-camera-1.jpg)

1. Upload **store-camera-2.jpg** and review the face detection details that are returned.

    ![An image of more people in a store.](./media/create-face-solutions/store-camera-2.jpg)

1. Upload **store-camera-3.jpg** and review the face detection details that are returned.

    ![An image of people in a store with a plant obscuring a face.](./media/create-face-solutions/store-camera-3.jpg)

In this exercise you have explored how Azure AI services can detect faces in images. You have seen that AI services can detect faces despite being partially obscured. If you have time, feel free to try the sample images or some of your own images.

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the [Azure portal](https://portal.azure.com) and select the resource group that contains the resource you created.
1. Select the resource and select **Delete** and then **Yes** to confirm. The resource is then deleted.

## Learn more

To learn more about what you can do with this service, see the [Azure AI Face service page](https://learn.microsoft.com/azure/ai-services/computer-vision/overview-identity).
