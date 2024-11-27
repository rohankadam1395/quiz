import os
import json
import csv

def process_json_files(directory, output_csv):
    # Define the header for the CSV
    csv_header = ["userId", "name", "email", "answers", "correct_count", "submittedAt"]
    
    # Open the CSV file for writing
    with open(output_csv, mode='w', newline='', encoding='utf-8') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=csv_header)
        writer.writeheader()  # Write the header to the CSV

        # Iterate over all files in the specified directory
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            # Read and parse the JSON file
            with open(file_path, 'r', encoding='utf-8') as json_file:
                try:
                    data = json.load(json_file)
                    
                    # Combine answers into a single JSON string
                    answers = data.get("answers", [])
                    combined_answers = json.dumps(answers)
                    # Count correct answers
                    correct_count = sum(
                        1 for answer in answers if answer.get("answer") == answer.get("correct_answer")
                    )
                    # Write a single row for the user
                    writer.writerow({
                        "userId": data.get("userId", ""),
                        "name": data.get("name", ""),
                        "email": data.get("email", ""),
                        "answers": combined_answers,
                        "correct_count": correct_count,
                        "submittedAt": data.get("submittedAt", "")
                    })
                except json.JSONDecodeError:
                    print(f"Error decoding JSON in file: {file_path}")

if __name__ == "__main__":
    # Specify the directory containing the JSON files and the output CSV file name
    json_directory = "./result_json_files"  # Update this to your directory path
    output_csv_file = "combined_results.csv"

    # Process the JSON files and generate the CSV
    process_json_files(json_directory, output_csv_file)
    print(f"CSV file '{output_csv_file}' created successfully!")
