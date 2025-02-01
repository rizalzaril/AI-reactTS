import React, { useState } from "react";
import Groq from "groq-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";

const Home: React.FC = () => {
  type Message = {
    role: "assistant" | "user";
    content: string;
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Zaril AI" },
  ]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    const newUserMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [...messages, newUserMessage],
        stream: true, // Enable streaming
      });

      let streamedMessage = "";
      const aiMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, aiMessage]);

      for await (const chunk of response) {
        if (chunk.choices?.[0]?.delta?.content) {
          streamedMessage += chunk.choices[0].delta.content;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              ...aiMessage,
              content: streamedMessage,
            };
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const removeSpecialSymbols = (content: string) => {
    return content.replace(/[*`]/g, ""); // Remove asterisks (*) and backticks (`)
  };

  const formatContent = (content: string) => {
    // Handle numbered lists
    const listPattern = /(\d+\.\s)([^\n]+)/g;
    const formattedContent = content
      .replace(listPattern, (match, number, item) => {
        return `<li>${item}</li>`; // Wrap list items with <li> tags
      })
      .replace(/\n/g, "<br />"); // Convert newlines to <br /> for paragraph breaks
    return formattedContent;
  };

  const isCode = (content: string) => {
    return content.includes("```"); // Check if the content includes code block syntax (```)
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-2xl w-full max-w-4xl p-4">
        <div className="h-[600px] md:h-[700px] overflow-y-auto p-4 border-b flex flex-col gap-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-200 text-start p-6 self-start"
              }`}
            >
              {isCode(msg.content) ? (
                <pre className="bg-gray-800 text-start text-green-400 p-4 rounded-lg overflow-auto">
                  {removeSpecialSymbols(msg.content.replace(/```/g, ""))}
                </pre>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatContent(removeSpecialSymbols(msg.content)),
                  }}
                />
              )}
            </div>
          ))}
          {loading ? <div className="loader"></div> : ""}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <textarea
            className="flex-grow bg-transparent border border-blue-500 p-2 rounded focus:outline-none"
            rows={2}
            placeholder="Ketik pesan ke ChatAI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faArrowAltCircleRight} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
