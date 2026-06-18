//Global shadow ban alert for admins
//Your Admin dashboard can now show a real-time Shadcn/UI Alert when a spammer is detected.

channel.on("new_notification", (n) => {
  if (n.type === "admin_spam_alert") {
    toast({
      variant: "destructive",
      title: "Spam Attack Detected! 🛡️",
      description: n.data.message,
      action: <Button onClick={() => banIP(n.data.target_id)}>Block IP</Button>
    });
  }
});

/*
4. Why this is the "Golden Path":

    Proactive Defense: You don't just "ignore" spammers; you monitor their behavior to see if they are a bot network.
    Resource Management: By using Oban's schedule_in, you don't slow down the "Ghosted" user's request, keeping the "Shadow" illusion perfectly intact.
    Admin Efficiency: Your team only gets pings when a banned user is actively being aggressive, rather than for every single ghosted post.
*/