I want to create a procurement application that small and large companies can use for their procurement activities.
The platform will have the following section as a start:
-	Material request (MR) page: this is the starting point where the end user will request items to purchase.
-	Procurement page: this is where the procurement team will check the received MRs, and start the supplier selection and contact. We should be able to send an RFQ (Request for Quotation) to suppliers from the app and manage received prices – once we have sufficient quotations, we can submit them to the end user who will approve 1 of the quotations
-	Purchase requisition (PR): once a quotation is approved, the procurement officers can submit a purchase request either with manual input or by uploading an excel file
-	Purchase order (PO): once PR is approved a PO is placed and once approved the PO is sent to suppliers
-	Supplier management page: where all the suppliers data is stored including contacts, emails, locations, rankings, etc.
-	Items database: where we will store all the requested items to form a database of items and prices and where they were purchased from
-	Analytics: data on:
o	Numbers of PRs per month
o	Value of POs per month
o	Most chosen suppliers with their purchase value
o	Items price analysis
o	Etc.
-	Admin page: this is where admin will assign roles and give access to users based on their roles. We can also create projects and do all admin related tasks. We will also assign in this page the authorization policy for each project for the approval process.
-	Projects selection: Chose the projects we are working on with User authentication
Workflow:
“End user raises MR → Procurement sends RFQ → Quote Approval (end-user mandatory) → PR raised and routed for approval (multi-step if required) → PO raised and routed for approval (multi-step depending on PO value) → PO sent to supplier.”
All data should be stored in Supabase
