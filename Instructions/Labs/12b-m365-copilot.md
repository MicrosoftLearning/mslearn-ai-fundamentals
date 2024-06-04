---
lab:
    title: 'Explore Copilot for Microsoft 365'
---
# Explore Copilot for Microsoft 365

In this exercise you will explore some of the ways in which Microsoft Copilot can use generative AI to help you be more productive when creating new content. In the scenario for this exercise, you will start with some high-level notes for a business idea, and use Copilot for Microsoft 365 across multiple apps such as Word, PowerPoint, and Excel to help you develop a business plan and a presentation for potential investors.

This exercise should take approximately **40** minutes to complete.

> **Note**: This exercise requires a **Copilot for Microsoft 365** license from your organization.

## Use Copilot to explore a document and research an idea

To start your exploration of generative AI, let's use Copilot for Word to examine an existing document and extract some insights from it.

1. In your web browser, open the document [Business Idea.docx](https://github.com/MicrosoftLearning/mslearn-ai-fundamentals/raw/main/data/generative-ai/Business%20Idea.docx) at `https://github.com/MicrosoftLearning/mslearn-ai-fundamentals/raw/main/data/generative-ai/Business%20Idea.docx`. 
1. Select **Download** to save the file to your PC's **Downloads** folder.
1. **Move** or **Copy & Paste** the document you just downloaded to the **OneDrive** folder.
1. From your **OneDrive** folder, open **Business Idea.docx** in Microsoft Word (closing any welcome messages or notifications of new features) and review the document, which describes some high-level ideas for a cleaning business in New York City. If prompted, select **Enable editing** at the top.
1. Find and select the **Copilot** icon on the Word toolbar to open the Copilot pane, as shown here (your visual theme may vary):

    ![Screenshot of the Copilot pane in Microsoft Word.](./media/generative-ai/copilot-word-pane.png)

1. In the Copilot pane, enter following the prompt in the text area at the bottom:

    ```
    What is this document about?
    ```

1. Review the response from Copilot, which should summarize the main points in the document, as shown here:

    ![Screenshot of the Copilot pane in Word with a response.](./media/generative-ai/copilot-response-word.png)

    > The specific response you receive may vary due to the nature of generative AI.

1. Return to the Copilot pane to ask Copilot the following question:

    ```
    How do I setup a new business in New York?
    ```

1. Review the response and follow up with additional questions as needed. When you're happy with the response, use the **Copy** (&#128461;) icon under the response to copy it to the clipboard. Paste it into the Word document, select all the text and then select the Copilot icon to visualize the text as a table.

    ![Screenshot asking Copilot to visualize in a table format.](./media/generative-ai/copilot-rewrite-as-table.png)

1. Review the table and ask Copilot to add more information, such as references for more details.  Your response should look something like this (you may need to use the **Regenerate** button):

    ![Screenshot of the response from Copilot in a table format.](./media/generative-ai/copilot-rewrite-as-table-response.png)

    > **Important**: The AI-generated response is based on information publicly on the Web. While it may be useful to help you understand the steps required to set up a business, it is not guaranteed to be 100% accurate and does not replace the need for professional advice!

1. When you're happy with the table that Copilot has generated, select the option to **Keep it**.

## Use Copilot to create content for a business plan

Now that you've done some initial research, let's have Copilot help you develop a business plan for your cleaning company.

1. With the **Business Idea.docx** document still open, in the Copilot pane, enter the following prompt:

    ```
    Can you suggest a name for my cleaning business?
    ```

1. Review the suggestions and select a name for your cleaning company (or continue prompting to find a name you like).
1. In the Word document, select the Copilot icon in the margin to draft new content. Enter the following prompt, replacing **Contoso Cleaning** with the company name of your choice:

    ```
    Write a business plan for "Contoso Cleaning" based on the information in this document. Include an executive summary, market overview, and financial projections.
    ```

    ![Screenshot of the Copilot drafting a business plan.](./media/generative-ai/copilot-draft-business-plan-prompt.png)

1. Review the response drafted by Copilot and keep it, adjust the tone, length, or ask Copilot to rewrite it with a new prompt. Apply appropriate headings and styling to your document to make it look professional. Your response should look something like this:

    ![Screenshot of a Word document with a Copilot-generated business plan.](./media/generative-ai/copilot-draft-business-plan-response.png)

1. If the financial projections in the business plan is not formatted as a table, select it and use Copilot to visualize the projections as a table.
1. Select the table of financial projections and copy it to the clipboard.
1. Save the Word document.

## Visualize financial projections in Copilot for Excel

With a business plan in hand, let's take some of that data on financial projections and ask Copilot in Excel to visualize that data for us, so we can include it in emails or presentations to investors.

1. On your PC with Microsoft 365 apps installed, open **Excel** and create a new blank workbook. Immediately save the workbook as **Financial Projetions.xlsx** to OneDrive, or Copilot won't work.
1. Paste the table of sales projection from **Business Idea.docx** into the Excel spreadsheet and **format it as a table**. To do this:
    1. Select a **cell** within your data.
    1. Select **Home** and choose **Format as Table** under Styles. 
    1. Choose a style for your table.
    1. In the **Create Table** dialog box, confirm or set your cell range.
    1. Mark if your table has headers, and select **OK**.
1. With your sales projections formatted as a table, open the Copilot pane from the Excel ribbon and enter the following prompt:

    ```
    Suggest ways to visualize these financial projections.
    ```
    
1. Copilot should suggest 1 or 2 ways to visualize your data and offer to add a pivot chart to a new sheet.

    ![Screenshot of Copilot in Excel visualizing financial projections.](./media/generative-ai/copilot-excel-visualize-projections.png)

1. However, you may want to see more data in the chart to show year-over-year changes, so enter the following prompt to add more:

    ```
    Visualize these financial projections in a line chart to show year-over-year revenue and profits.
    ```

    ![Screenshot of Copilot in Excel visualizing financial projections.](./media/generative-ai/copilot-excel-visualize-more.png)

1. Add the pivot chart to a new sheet and open it. Select the chart and then select **Design** to apply styles, change the chart type and other actions. At the end, you should have something that resembles this:

    ![Screenshot of Copilot in Excel adding a PivotChart.](./media/generative-ai/copilot-excel-chart-design.png)

1. Save the file to OneDrive and close Excel.

You have just used data created from Copilot in Word to visualize it in Excel. In the next exercise, you'll move onto using Copilot in Outlook to compose and send emails about the work you've done.

## Use Copilot to compose an email

You've created some collateral to help you get your business started. Now it's time to reach out to an investor seeking some startup funding.

1. On your PC with Microsoft 365 apps installed, open **Outlook**. If you haven't setup Outlook with your Microsoft 365 account, see [Set up and use Outlook - Microsoft Support](https://support.microsoft.com/office/set-up-and-use-outlook-4636f361-d5e3-4a87-9cd4-382858de55fa).
1. Turn on the **new Outlook** experience. To get the latest Copilot features in Outlook, you should be using the "New Outlook" experience. To see which version you're using, see [What version of Outlook do I have? - Microsoft Support](https://support.microsoft.com/office/what-version-of-outlook-do-i-have-b3a9568c-edb5-42b9-9825-d48d82b2257c).
1. Create a new email, and fill in the **To** box with your own email address.
1. You can start drafting your email from the Copilot pane or right from within the body of the email:

    ![Screenshot of Outlook and the options to draft an email with Copilot.](./media/generative-ai/copilot-draft-email-outlook.png)
    
1. Enter the following prompt and adjust the tone to "Formal" and the length to "Medium":

    ```
    Request a meeting with an investment bank to discuss funding for a commercial cleaning business.
    ```

    ![Screenshot of drafting an email with Copilot in Outlook.](./media/generative-ai/copilot-draft-email-adjust-tone-outlook.png)

1. Select **Generate draft**, and review the output that is generated. Adjust the tone or tell Copilot what you'd like to change about the email.

    ![Screenshot of the email generated with Copilot in Outlook.](./media/generative-ai/copilot-draft-email-results-outlook.png)

1. You can send the email to yourself if you wish!

## Use Copilot to create content for a presentation

With Copilot's help, you've created a draft of a business plan for the cleaning business idea, prepared some financial projections, and sent an email to request a meeting with a potential investor. Now you'll need an effective presentation to communicate the benefits of your business.

1. Open **PowerPoint** and create a new **blank presentation**. If the **Designer** pane opens automatically, close it.

    ![Screenshot of creating a new blank presentation in PowerPoint.](./media/generative-ai/powerpoint-create-blank-presentation.png)

1. Save the presentation as **Cleaning Company.pptx** in your OneDrive folder.
1. Select the **Copilot button** in the **Home tab** of the ribbon, select **Create presentation about...**, then complete the prompt in the Copilot pane as follows:

    ```
    Create a presentation about a corporate cleaning service in New York City.
    ```

1. Copilot will generate slides in the presentation.  The process may take several minutes and your output should look something like this with a different theme:

    ![Screenshot of PowerPoint presentation created by Copilot from a Word document.](./media/generative-ai/copilot-powerpoint-create-image.png)

1. Select the second last slide in the presentation. Then, in the Copilot pane, ask to add a new slide using this prompt:

    ```
    Add a slide that describes the benefits of an eco-friendly approach to cleaning. 
    ```

    ![Screenshot of PowerPoint presentation create a new slide.](./media/generative-ai/copilot-powerpoint-add-new-slide.png)

1. Save the presentation.

## Challenge

Now you've seen how to use Copilot for Microsoft 365 in a couple different apps to research ideas and generate content, why not try exploring further? Try using Copilot to plan an event to promote children's literacy at a local library. Some things you could try include:

- Research some tips for encouraging children to read at an early age.
- Create a flyer or poster for the event.
- Compose an email for a campaign to invite local children's authors to come and speak at the event.
- Create a presentation to start the event.

Be as inventive as you like, and explore how Copilot can help you by finding information, generating and refining text, creating images, and answering questions.

## Conclusion

In this exercise, you've used [Copilot for Microsoft 365](https://www.microsoft.com/microsoft-365/enterprise/copilot-for-microsoft-365) to find information and generate content. Hopefully you've seen how using generative AI in a copilot can help with productivity and creativity. Microsoft 365 enables you to bring the power of generative AI to your business data and processes, while integrating into your existing IT infrastructure to ensure a manageable, secure solution.
