from rules import check_missing_fields, check_invalid_json

def analyze_request(data):
    issues = []

    json_issue = check_invalid_json(data)
    if json_issue:
        issues.append(json_issue)

    missing_fields_issue = check_missing_fields(data)
    if missing_fields_issue:
        issues.append(missing_fields_issue)

    return issues