---
lab:
    title: 'Explore Microsoft 365 Copilot'
---
# Explore Microsoft 365 Copilot

Welcome to the exciting world of Microsoft 365 Copilot!

In this exercise, you'll harness the power of Copilot to explore a new business idea: starting a corporate cleaning company.

Imagine this: you're about to launch a top-notch cleaning service that will revolutionize office spaces everywhere. With Microsoft Copilot by your side, you'll research market trends and develop a solid business plan. But that's not all! You'll also create compelling documents, eye-catching presentations, and persuasive emails to help get your idea off the ground and attract investors.

Get ready to unleash your creativity and business acumen as you navigate through this engaging and interactive lab. By the end of this exercise, you'll have a comprehensive set of materials that will set you on the path to entrepreneurial success. Let's get started and make your corporate cleaning company a reality!

This exercise should take approximately **40** minutes to complete.

> **Note**: This exercise requires a **Microsoft 365 Copilot** license.

## Use Copilot to explore a document and research an idea

To start your exploration of generative AI, let's use Copilot for Word to examine an existing document and extract some insights from it.

1. In a web browser, open the document [Business Idea.docx](https://github.com/MicrosoftLearning/mslearn-ai-fundamentals/raw/main/data/generative-ai/Business%20Idea.docx) at `https://github.com/MicrosoftLearning/mslearn-ai-fundamentals/raw/main/data/generative-ai/Business%20Idea.docx`. 
1. Download the file to your **Downloads** folder. Then close the web browser.
1. **Move** or **Copy & Paste** the document you just downloaded to the **OneDrive** folder.
1. From your **OneDrive** folder, open **Business Idea.docx** in Microsoft Word (closing any welcome messages or notifications of new features) and review the document, which describes some high-level ideas for a cleaning business in New York City. If prompted, select **Enable editing** at the top.

    > **Tip**: You can close the **Navigation** pane if it is open to see more of the document.

1. Find and select the **Copilot** icon on the Word toolbar to open the Copilot pane, as shown here (your visual theme may vary):

    ![Screenshot of the Copilot pane in Microsoft Word.](./media/generative-ai/copilot-word-pane.png)

1. In the Copilot pane, enter following the prompt in the text area at the bottom:

    ```text
    Summarize this document.
    ```

1. Review the response from Copilot, which should summarize the main points in the document, as shown here:

    ![Screenshot of the Copilot pane in Word with a response.](./media/generative-ai/copilot-response-word.png)

    > The specific response you receive may vary due to the nature of generative AI.

    Hopefully, Copilot has provided some useful guidance. However if you have additional questions, you can just ask for more specific information.

1. Return to the Copilot pane to ask Copilot the following question:

    ```text
    How do I setup a new business in New York? Answer with a numbered list.
    ```

1. Review the response and follow up with additional questions as needed. When you're happy with the response, use the **Copy** (&#128461;) icon under the response to copy it to the clipboard. Paste it into the Word document after the existing text. Then select the text that provides a list of things to do when setting up a business in New York and use the Copilot icon (at the bottom of the selected text) to visualize the text as a table.

    ![Screenshot asking Copilot to visualize in a table format.](./media/generative-ai/copilot-rewrite-as-table.png)

1. Review the table and ask Copilot to add more information, such as a column with references for more details.  Your response should look something like this (you may need to use the **Regenerate** button):

    ![Screenshot of the response from Copilot in a table format.](./media/generative-ai/copilot-rewrite-as-table-response.png)

    > **Important**: The AI-generated response is based on information publicly on the Web. While it may be useful to help you understand the steps required to set up a business, it is not guaranteed to be 100% accurate and does not replace the need for professional advice!

1. When you're happy with the table that Copilot has generated, select the option to **Keep it**.

## Use Copilot to create content for a business plan

Now that you've done some initial research, let's have Copilot help you develop a business plan for your cleaning company.

1. With the **Business Idea.docx** document still open, in the Copilot pane, enter the following prompt:

    ```text
    Can you suggest a name for my cleaning business?
    ```

1. Review the suggestions and select a name for your cleaning company (or continue prompting for more suggestions find a name you like).
1. Create a new blank document. Then, in the new document, select the Copilot icon in the margin to draft new content. Enter the following prompt, replacing **Contoso Cleaning** with the company name of your choice:

    ```text
    Write a business plan for "Contoso Cleaning" based on the information in /Business Idea.docx. Include an executive summary, market overview, and financial projections.
    ```

    ![Screenshot of the Copilot drafting a business plan.](./media/generative-ai/copilot-draft-business-plan-prompt.png)

    > **Tip**: Type the prompt, and when you type "/" Copilot should enable you to browse the documents in your **Documents** folder. If Copilot does not suggest any documents, it may be because your OneDrive has not yet been fully indexed. In this case, modify the prompt to `Write a business plan for "Contoso Cleaning", a commercial cleaning buisness in New York. Include an executive summary, market overview, and financial projections.`.

1. Generate and review a response. Then keep it, adjust the tone, length, or ask Copilot to rewrite it with a new prompt. Apply appropriate headings and styling to your document to make it look professional before saving it as **Business Plan.docx** in your OneDrive folder. Your document should look something like this:

    ![Screenshot of a Word document with a Copilot-generated business plan.](./media/generative-ai/copilot-draft-business-plan-response.png)

## Visualize financial projections in Copilot for Excel

With a business plan in hand, let's take some of that data on financial projections and ask Copilot in Excel to visualize that data for us, so we can include it in emails or presentations to investors.

1. With the **Business Plan** document open in Microsoft Word, in the Copilot pane, enter the following prompt:

    ```text
    Create a table of projected profits for the next 5 years, starting with this year. The profit this year should be $10,000 and it should increase by 12% each year.
    ```

1. Copy the table of projected profits to the clipboard.
1. Open **Excel** and create a new blank workbook. Immediately save the workbook as **Financial Projections.xlsx** to your OneDrive folder.
1. Paste the table of profit projections into the Excel spreadsheet and **format it as a table**. To do this:
    1. Select a **cell** within your data.
    1. Select **Home** and choose **Format as Table** under Styles. 
    1. Choose a style for your table.
    1. In the **Create Table** dialog box, confirm or set your cell range.
    1. Mark if your table has headers, and select **OK**.
1. With your sales projections formatted as a table, open the Copilot pane from the **Home** tab of the Excel ribbon and enter the following prompt:

    ```text
    Suggest ways to visualize these financial projections.
    ```
    
1. Copilot should suggest a way to visualize your data and offer to add a pivot chart to a new sheet.

    ![Screenshot of Copilot in Excel visualizing financial projections.](./media/generative-ai/copilot-excel-visualize-projections.png)

    > **Tip**: If Copilot suggests a different format for the data, enter the follow-on prompt `Visualize the data as a line chart.`.

1. Select the option in the Copilot response to add the pivot chart to a new sheet and open it. Select the chart and then select **Design** to apply styles, change the chart type and other actions. At the end, you should have something that resembles this:

    ![Screenshot of Copilot in Excel adding a PivotChart.](./media/generative-ai/copilot-excel-chart-design.png)

1. Save the workbook and close Excel.

You have just used data created from Copilot in Word to visualize it in Excel. In the next exercise, you'll move onto using Copilot in Outlook to compose and send emails about the work you've done.

## Use Copilot to create content for a presentation

With Copilot's help, you've created a draft of a business plan for the cleaning business idea and prepared some financial projections. Now you'll need an effective presentation to communicate the benefits of your business.

1. Open **PowerPoint** and create a new **blank presentation**. If the **Designer** pane opens automatically, close it.
1. Save the presentation as **Cleaning Company.pptx** in your OneDrive folder.
1. Select the **Copilot button** in the **Home tab** of the ribbon, select **Create presentation about...**, then complete the prompt in the Copilot pane as follows:

    ```text
    Create a presentation about a corporate cleaning service named "Contoso Cleaning" in New York City. The presentation should include the benefits of using a professional cleaning business.
    ```

1. Copilot will generate slides in the presentation.  The process may take several minutes and your output should look something like this with a different theme:

    ![Screenshot of PowerPoint presentation created by Copilot from a Word document.](./media/generative-ai/copilot-powerpoint-create-image.png)

1. Select the last slide in the presentation. Then, in the Copilot pane, in the chat box, select the **View prompts** icon and select the **Add a slide about...** prompt to create a new slide using the prompt `Add a slide about the benefits of an eco-friendly approach to cleaning.`

    ![Screenshot of PowerPoint presentation create a new slide.](./media/generative-ai/copilot-powerpoint-add-new-slide.png)

1. Save the presentation and close PowerPoint.

## Use Copilot to arrange a funding meeting

You've created some collateral to help you get your business started. Now it's time to reach out to an investor seeking some startup funding.

1. Open **Outlook**, and on the title bar, use the **Copilot** icon to open the Copilot pane.
1. Switch to the **Calendar** page and change the view to **Work week**. If you don't already have any scheduled events in your calendar for this week, you can add a couple so that Copilot has some information to work with.
1. In the Copilot pane, enter the following prompt:

    ```
    What events do I have scheduled this week?
    ```

    Copilot should respond with a summary of your scheduled events for the week - helping you identify availability for a meeting with a bank manager to arrange startup funding.

1. Switch to the **Mail** page and create a new email, and fill in the **To** box with your own email address.
1. Select the option to **Draft with Copilot**:

    ![Screenshot of Outlook and the option to draft an email with Copilot.](./media/generative-ai/copilot-draft-email-outlook.png)
    
1. Enter the following prompt to generate a draft email:

    ```text
    Write an email to a bank manager requesting a meeting to discuss funding for a commercial cleaning business. The email should be concise and the tone should be professional.
    ```

1. Use Copilot to refine the email content, and then select **Keep it** to finalize the message.

    ![Screenshot of drafting an email with Copilot in Outlook.](./media/generative-ai/copilot-draft-email-adjust-tone-outlook.png)

1. You can send the email to yourself if you wish!

## Challenge

Now you've seen how to use Microsoft 365 Copilot to research ideas and generate content, why not try exploring further? 

Based on what you've learned in this exercise, try using Copilot to plan a meeting in which you'll propose the adoption of generative AI in your organization. Here are a few ideas to get you started:

- Research the benefits of generative AI and Microsoft Copilot for businesses, finding information about productivity benefits, cost-savings, and examples of organizations that have already successfully adopted AI.
- Create a discussion document that you can circulate as pre-reading before the meeting.
- Create a presentation that you can use to present your case, including data and visualizations to emphasize key elements of your pitch.
- Compose an email to tell your coworkers about the meeting and provide some context for it.

Be as inventive as you like, and explore how Copilot can help you by finding information, generating and refining text, creating images, and answering questions.

## Conclusion

In this exercise, you've used [Microsoft 365 Copilot](https://www.microsoft.com/microsoft-365/enterprise/copilot-for-microsoft-365) to find information and generate content. Hopefully you've seen how using generative AI in a copilot can help with productivity and creativity. Microsoft 365 enables you to bring the power of generative AI to your business data and processes, while integrating into your existing IT infrastructure to ensure a manageable, secure solution.
