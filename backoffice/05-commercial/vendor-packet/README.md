# Vendor Packet — send folder

**Product:** a complete PDF packet GCs / PMs / facilities can put in a vendor file.

## What’s in it

1. Cover + capabilities statement (generated)
2. W-9
3. General liability certificate (Next)
4. Workers’ compensation certificate (biBERK)
5. Florida business registration (Sunbiz)

## Build / refresh the send copy

Compliance PDFs stay in Downloads (not git). From this folder:

```bash
python3 assemble-packet.py
```

That writes to your Desktop:

`~/Desktop/PaintnPete-Vendor-Packet-YYYY-MM/`

including one merged file:

`PaintnPete-Vendor-Packet-COMPLETE-YYYY-MM.pdf`

## Before you hit send

- [ ] Open the complete PDF and spot-check pages
- [ ] If they need **Additional Insured** in their name, request a new GL cert from Next (do not reuse a cert issued to another company as their AI)
- [ ] Add named trade references when you have permission (packet currently says “available on request”)

## Edit the capabilities pages

Edit `00-cover-and-capabilities.html`, then re-run `assemble-packet.py`.
