1. Landing page
    1. Sign in page with
        1. Username
        2. Password
        3. or request access
        4. Admin
        
        add remember me toggle
        
        first time signing in, send OTP to email
        
        Based on the username, they will log in into their specific project

2. Admin (Landing page): this is a page where we initiate projects and define initial roles. later, once the project runs, the Admin would be able to change and update roles


3. Header
    1. instead of Global Operations, put the name of the project
    2. Instead of PP, we will put the logo of the company. the logo of the company will be added in the project initiation page in the main admin section in the landing page
    3. Right side (from right to left)
        1. User initials. when pressed, menu to update profile
            1. Update profile: change name, email, phone number, address, designation 
        2. notification bell
        3. Role → hardcoded (Bold) this role will be predefined. 
    
    All elements in the header should be perfectly aligned

4. MRs
    1. the 3 buttoms Import from Excel, Add line item, and submit material request should be aligned with the title of the page on top right

5. RFQs
    1. remove Supplier Suggestions from the right side
    2. move status to the last column of the table
        1. Status starts with New Request (light red background), RFQ Sent (light green background)
        2. Once the Send RFQ button, it toggles from Requested to RFQ sent.
        3. Remove the amount - at this stage we dont know the cost
        4. remove compare quotes from the table
        5. View details button will show the details of the MR
    3. RFQ Wizard:
        1. once the create RFQ button is pressed, we will get the initial table with multiple line items
        2. under each line item, we will have a list of suppliers, with contacts and names and all details suggested by the app. there are based on previous purchases
        3. if no suppliers are suggested, then the ability to add new suppliers.
        4. we can then send the request for each supplier individually, or select all (at the line item level) and send to all

6. Quotes
    1. In the quote approvals, the right side select supplier is not required. we can choose directly from the quote itself
    2. make it more compact and wider