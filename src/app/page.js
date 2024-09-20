"use client"
import { useEffect, useState } from "react";
import Papa from 'papaparse';
import Summary from "../../components/summary";

const AWS_BUCKET_URL = "https://plaid-transactions-history.s3.us-west-1.amazonaws.com"
const TRANS_IMG_ALT_URL = "https://plaid-transactions-history.s3.us-west-1.amazonaws.com/images/creeper.png"

const dateToStr = (date) => {
  /* Takes in a Date object and returns a string of the form
      YYYY/MM/DD
  */
  const Y = date.getFullYear()
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const DD = String(date.getDate()).padStart(2, '0')
  
  return `${Y}/${MM}/${DD}`
}

const daysDelta = (dateStr, delta) => {
  /* increments the week by delta * weeks */
  const date = new Date(dateStr)
  date.setDate(date.getDate() + delta)
  return dateToStr(date)
}

const fetchTransactionsWeek = async (dateStr) => {
  /*
    Fetches transactions data for a single week.
    Weeks are considered as monday - sunday. Transactions for weeks are stored in files according
    to the monday of the week in the form YYYY/MM/DD

    If input date is not a monday, this will still work.

    Returns a list of json objects as the rows of the table
  */
  
  const date = new Date(dateStr)
  date.setDate(date.getDate() - date.getDay() + 1) // normalize the date to the nearest monday
  dateStr = dateToStr(date);

  const csvUrl = `${AWS_BUCKET_URL}/${dateStr}.csv`
  
  console.log("the url: ", csvUrl)
  
  console.log("fetching transactions for week: ", dateStr)
  try {
    // Fetch the CSV file
    const response = await fetch(csvUrl, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    const csvText = await response.text();

    if (!response.ok) {
      return []
    }
    // Use PapaParse to convert CSV to JSON
    const parsedData = Papa.parse(csvText, {
      header: true, // First row of CSV is treated as headers
      skipEmptyLines: true,
    });

    // Update the state with the parsed data
    console.log("the parsed data", parsedData.data)
    return parsedData.data
  } catch (error) {
    console.error('Error fetching or parsing CSV file:', error);
  }
};

export default function Home() {

  const [transactions, setTransactions] = useState([])

  const currDate = new Date()
  currDate.setDate(currDate.getDate() - currDate.getDay() + 1)
  const [currWeek, setWeek] = useState(dateToStr(currDate))

  const transactions_total = transactions.reduce((s, c) => (s + parseFloat(c.amount)), 0).toFixed(2)
  const weeksDisplay = `${currWeek} - ${daysDelta(currWeek, 6)}`

  useEffect(() => {
    fetchTransactionsWeek(currWeek)
    .then((data) => setTransactions(data))
  }, [currWeek])
  
  return (
    <div style={{
      textAlign: "center",
      "font-family": "Helvetica"
    }}>
      transactions home page

      <div style={{ height: "15px" }}/>

      {/* Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white"
      }}>
        <div
          style={{
            padding: "10px",
            backgroundColor:"black",
            cursor: "pointer"
          }}
          onClick={() => {setWeek(daysDelta(currWeek, -7))}}
        >
          {"<"}
        </div>

        <div
          style={{
            padding: "10px",
            backgroundColor: "black",
            margin: "5px",
          }}
        >
          {weeksDisplay}
        </div>

        <div
          style={{
            padding: "10px",
            backgroundColor: "black",
            cursor:"pointer"
          }}
          onClick={() => {setWeek(daysDelta(currWeek, 7))}}
        >
          {">"}
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center"
      }}>
        {/* Transactions */}
        <div>
          {transactions.length == 0 ? (
            <div>
              No transactions
            </div>
          ) : (
            <div>
              {transactions.map((trans) => (
                <div>
                  <div style={{
                    margin: "10px",
                    padding: "10px",
                    backgroundColor: "#004BA8",
                    color: "white",
                    borderRadius: "5px",
                    display: "inline-block",
                    width: "250px",
                    position: "relative",
                    "box-shadow": "rgba(0, 0, 0, 0.35) 0px 5px 15px"
                  }}>
                    <div
                      style={{
                        display: "flex",
                        alignContent: "center",
                        width: "50%"
                      }}
                    >
                      <div style={{
                        textAlign: "left"
                      }}>
                        <div style={{
                          fontSize: "25px",
                          fontWeight: "900",
                        }}>
                          ${trans.amount}
                        </div>
                  
                        <div>
                          {trans.merchant_name}
                        </div>

                        <div style={{
                          "font-style": "italic"
                        }}>
                          {trans.authorized_date}
                        </div>

                        <div style={{ height: "20px"}}/>

                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              marginRight: "15px"
                            }}
                          >
                            x0 <input type="checkbox"/>
                          </div>

                          <div>
                            x0.5 <input type="checkbox"/>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}>
                        <img src={trans.logo_url || TRANS_IMG_ALT_URL} height="50px" width="50px"/>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Transactions Summary Data */}
        <div
          style={{ margin: "5px"}}
        >
          <Summary transactions={transactions} currWeek={currWeek} />
        </div>

      </div>
    </div>
  );
}


export { daysDelta }