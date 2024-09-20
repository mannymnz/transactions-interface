import { daysDelta } from "../src/app/page"

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export default function Summary({ transactions, currWeek }) {
    let total = transactions.reduce(
        (a, c) => (a + parseFloat(c.amount)), 0
    )
    total = Math.ceil(total * 100) / 100


    // computing total by day
    const totals_by_day = []
    for (let i = 0; i < 7; i++) {
        let day = daysDelta(currWeek, i)
        let day_normalized = day.replace(/\//g, "-")

        console.log(day_normalized)

        let total_for_day = transactions.reduce(
            (a, c) => {
                if (c.authorized_date == day_normalized) {
                    return a + parseFloat(c.amount)
                }
                return a
            }, 0
        )
        console.log(total_for_day)
        totals_by_day.push(Math.ceil(total_for_day * 100) / 100)
    }

    console.log(totals_by_day)

    return (
        <div style={{
            width: "200px"
        }}>

            <div
                style={{
                    background: "#0653b8",
                    color: "white",
                    margin: "5px",
                    padding: "15px",
                    borderRadius: "10px",
                }}
            >
                <div>Total:</div>
                <div style={{
                    fontSize:"30px",
                    fontWeight: "900"
                }}>
                    ${total}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {totals_by_day.map((trans, i) => (
                    <div
                        style={{
                            background: "#18bad6",
                            color: "white",
                            margin: "5px",
                            padding: "10px",
                            borderRadius: "10px"
                        }}
                    >
                        <div>{days[i]}</div>
                        <div>${totals_by_day[i]}</div>
                    </div>
                ))}

            </div>
        </div>
    )
}