---
lab:
    title: 'Explore Azure AI Services'
---

# Explore Azure AI Services

Azure AI services help users create AI applications with out-of-the-box and pre-built and customizable APIs and models. In this exercise you will take a look at one of the services, Azure AI Content Safety, in the Content Safety Studio.

The Content Safety Studio enables you to explore how text and image content can be moderated. You can run tests on sample text or images and get a severity score ranging from safe to high for each category. In this lab exercise you will create a single-service resource in the Content Safety Studio and test its functionalities. 

> **Note**
> The goal of this exercise is to get a general sense of how Azure AI services are provisioned and used. Content Safety is used as an example, but you are not expected to gain a comprehensive knowledge of content safety in this exercise!

## Navigate the Content Safety Studio 

![Screenshot of the content safety studio landing page.](./media/content-safety/content-safety-getting-started.png)

1. Open the [Content Safety Studio](https://contentsafety.cognitive.azure.com?azure-portal=true). If you are not logged in, you will need to sign in. Select **Sign In** on the top right of the screen. Use the email and password associated with your Azure subscription to sign in. 

2. The Content Safety Studio is set up like many other studios for Azure AI services. On the menu at the top of the screen, click on the icon on the left of *Azure AI*. You will see a drop-down list of other studios designed for development with Azure AI services. You can click on the icon again to hide the list.

![A screenshot of the Content Safety Studio's menu with a toggle selection open to switch to other studios.](./media/content-safety/studio-toggle-icon.png)  

## Associate a resource with the studio 

Before using the studio, you need to associate an Azure AI services resource with the studio. Depending on the studio, you may find you need a specific single-service resource, or can use a general multi-service resource. In the case of the Content Safety Studio, you can use the service by creating a single-service *Content Safety* resource or *Azure AI services* general multi-service resource. In the steps below, we will create a single-service Content Safety resource. 

1. On the top right of the screen, click on the **Settings** icon. 

![A screenshot of the settings icon on the top right of the screen, next to the bell, question mark, and smile icons.](./media/content-safety/settings-toggle.png)

2. On the **Settings** page, you will see a *Directory* tab and *Resource* tab. On the *Resource* tab, select **Create a new resource**. This takes you to page to create a resource in the Azure Portal.

> **Note**
> The *Directory* tab allows users to select different directories from which to create resources. You do not need to change its settings unless you wish to use a different directory. 

![Screenshot of where to select create a new resource from the Content Safety Studio's settings page.](./media/content-safety/create-new-resource-from-studio.png)

3. On the *Create Content Safety* page in the [Azure Portal](https://portal.azure.com?azure-portal=true), you need to configure several details to create your resource. Configure it with the following settings:
    - **Subscription**: *Your Azure subscription*.
    - **Resource group**: *Select or create a resource group with a unique name*.
    - **Region**: *Choose any available region. If in eastern US, use "East US 2"*.
    - **Name**: *Enter a unique name*.
    - **Pricing tier**: Free F0

4. Select **Review + Create** and review the configuration. Then select **Create**. The screen will indicate when the deployment is complete. 

*Congrats! You've just created, or provisioned, an Azure AI services resource. The one you provisioned in particular is a single-service Content Safety service resource.*

5. When the deployment is complete, open up a new tab and return to the [Content Safety Studio](https://contentsafety.cognitive.azure.com?azure-portal=true). 

6. Select the **Settings** icon on the top right of the screen again. This time you should see that your newly created resource has been added to the list.  

<details>  
    <summary><b>Troubleshooting</b>: Permissions for self-paced learners</summary>
    <p><b>If you are using a lab environment provided by an instructor, you can skip these steps.</b> Otherwise, continue with these steps:</p>
    <ul>
        <li>Select <b>View all properties in Azure portal</b> at the bottom of the *Settings* screen.</li>
        <li>In the Azure portal, select the <em>Content Safety resource</em> you just created. Then on the left-hand pane, select <b>Access Control (IAM)</b>. Then on the open pane, select <b>Add</b> next to the plus sign, and select <b>Add role assignment</b>.</li>
        <li>Search for <b>Cognitive Services User</b> in the list of roles, and select it. Then select <b>Next</b>. </li>
        <li>Under <b>Assign access to</b>, choose <b>User, group, or service principal</b>, <b>+ Select members</b>, select your name. Leave the description blank.</li>
        <li>Select <b>Next</b>. In the <b>Assignment type</b> page, select <b>Assignment type: Active</b>. Select <b>Assignment duration: Permanent</b>. Select <b>Next</b>.</li>
        <li>Select <b>Review and assign</b>, then <b>Review and assign</b> to add the role assignment.</li>
        <li>Return to the Content Safety Studio at https://contentsafety.cognitive.azure.com. Then select the <b>Settings</b> icon on the top right of the screen. Select the Content Safety resource you created. Check to make sure the <em>Current role assignments</em> includes <b>Cognitive Services User</b>. You may need to wait a moment and refresh the page to see the role assignment show up.</li>
    </ul>
</details>

7. If you haven't done so already, select the Content Safety resource you created. 

8. Click **Use resource** on the bottom of the screen. You will be taken back to the studio home page. Now you can begin using the studio with your newly created resource.

## Try out text moderation in the Content Safety Studio

1. On the Content Safety Studio home page, under *Run moderation tests*, navigate to the **Moderate text content** box and click **Try it out**.
2. Under run a simple test, click **Safe Content**. Notice that text is displayed in the box below. 
3. Click **Run test**. Running a test calls the Content Safety Service's deep learning model. The deep learning model has already been trained to recognize un-safe content.
4. In the *Results* panel, inspect the results. There are four severity levels from safe to high, and four types of harmful content. Does the Content Safety AI service consider this sample to be acceptable or not? What's important to note is that the results are within a confidence interval. A well-trained model, like one of Azure AI's out-of-the-box models, can return results that have a high probability of matching what a human would label the result. Each time you run a test, you call the model again. 
5. Now try another sample. Select the text under Violent content with misspelling. Check that the content is displayed in the box below.
6. Click **Run test** and inspect the results in the Results panel again. 

You can run tests on all the samples provided, then inspect the results.

## Check out the keys and endpoint

These capabilities you tested can be programmed into all sorts of applications. The keys and endpoint used for application development can be found both in the Content Safety Studio and the Azure Portal. 

1. In the Content Safety Studio, navigate back to the **Settings** page, with the *Resources* tab selected. Look for the resource you used. Scroll across to see the endpoint and key for your resource. 
2. In the Azure Portal, you will see that these are the *same* endpoint and *different* keys for your resource. To check it out, head to the [Azure Portal](https://portal.azure.com?auzre-portal=true). Search for *Content Safety* on the top search bar. Find your resource and click on it. On the left-hand menu, look under *Resource Management* for *Keys and Endpoints*. Select **Keys and Endpoints** to view the endpoint and keys for your resource. 

After you have finished, you can delete the Content Safety resource from the Azure Portal. Deleting the resource is a way to reduce costs that accrue when the resource exists in the subscription. To do this, navigate to the **Overview** page of your Content Safety resource. Select **Delete** at the top of the screen.

